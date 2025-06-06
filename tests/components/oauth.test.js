import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import OAuth from "../../src/components/oauth";
import { UserContext } from "../../src/context/userContext";

const mockLocation = (search = "") => {
  delete window.location;
  window.location = { href: "∅", search };
};

const renderWithCtx = (ctxOverrides = {}) => {
  const ctx = {
    user: null,
    oauthLogin: jest.fn(),
    ...ctxOverrides,
  };
  return {
    ctx,
    ...render(
      <UserContext.Provider value={ctx}>
        <OAuth />
      </UserContext.Provider>
    ),
  };
};

beforeEach(() => {
  jest.clearAllMocks();
  document.cookie = "";
  process.env.REACT_APP_BACKEND_URL = "/api";
  process.env.REACT_APP_FRONTEND_URL = "/";
});

describe("OAuth Minimal Unit Tests", () => {
  test("shows signup form when backend replies “signup incomplete”", async () => {
    document.cookie = "oauth_state=xyz";
    mockLocation("?code=abc&state=xyz");

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "signup incomplete",
        email: "demo@example.com",
      }),
    });

    renderWithCtx();

    expect(
      await screen.findByRole("heading", { name: /sign up/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/demo@example.com/)).toBeInTheDocument();
  });

  test("successful signup POST calls ctx.oauthLogin and redirects", async () => {
    document.cookie = "oauth_state=xyz";
    mockLocation("?code=abc&state=xyz");

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: "signup incomplete",
          email: "demo@example.com",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: "User Successfully Added",
          id: 42,
          username: "NewUser",
        }),
      });

    const { ctx } = renderWithCtx();

    fireEvent.change(await screen.findByLabelText(/username/i), {
      target: { value: "NewUser" },
    });
    fireEvent.click(screen.getByRole("button", { name: /signup/i }));

    await waitFor(() =>
      expect(ctx.oauthLogin).toHaveBeenCalledWith({
        id: 42,
        username: "NewUser",
      })
    );
    expect(window.location.href).toBe("/");
  });

  test("mismatching state cookie immediately redirects home", async () => {
    document.cookie = "oauth_state=xyz";
    mockLocation("?code=abc&state=WRONG");

    global.fetch = jest.fn();

    renderWithCtx();

    await waitFor(() => expect(window.location.href).toBe("/"));
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
