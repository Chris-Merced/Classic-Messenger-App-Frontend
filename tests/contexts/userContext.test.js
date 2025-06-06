import React, { useContext } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { UserProvider, UserContext } from "../../src/context/userContext";

const processEnvBackup = { ...process.env };
beforeEach(() => {
  process.env.REACT_APP_BACKEND_URL = "/api";
  global.fetch = jest.fn();
});
afterEach(() => {
  global.fetch.mockRestore?.();
  process.env = { ...processEnvBackup };
});

const Consumer = () => {
  const ctx = useContext(UserContext);
  return (
    <div>
      <span role="status">{ctx.user ? ctx.user.username : "none"}</span>
      <button onClick={() => ctx.login({ username: "Bob" })}>login-btn</button>
      <button onClick={ctx.logout}>logout-btn</button>
      <button onClick={() => ctx.oauthLogin({ id: 3, username: "Charlie" })}>
        oauth-btn
      </button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <MemoryRouter>
      <UserProvider>
        <Consumer />
      </UserProvider>
    </MemoryRouter>
  );

describe("UserContext Crucial Unit Tests", () => {
  test("on mount: hits /userProfile once and sets user", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, username: "Alice" } }),
    });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Alice")
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/userProfile",
      expect.objectContaining({ method: "GET" })
    );
  });

  test("login POST sets user and logout clears it", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 2, username: "Bob" }),
      });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("none")
    );

    fireEvent.click(screen.getByRole("button", { name: "login-btn" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Bob")
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/login",
      expect.objectContaining({ method: "POST" })
    );

    fireEvent.click(screen.getByRole("button", { name: "logout-btn" }));
    expect(screen.getByRole("status")).toHaveTextContent("none");
  });

  test("oauthLogin directly sets user", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderWithProvider();

    fireEvent.click(screen.getByRole("button", { name: "oauth-btn" }));
    expect(screen.getByRole("status")).toHaveTextContent("Charlie");
  });
});
