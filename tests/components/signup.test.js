import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import SignUpComponent from "../../src/components/signup";
import { UserContext } from "../../src/context/userContext";


const renderWithCtx = (user = null) => {
  const ctx = { user, login: jest.fn(), logout: jest.fn() };

  return {
    ctx,
    ...render(
      <MemoryRouter>
        <UserContext.Provider value={ctx}>
          <SignUpComponent />
        </UserContext.Provider>
      </MemoryRouter>
    ),
  };
};


describe("SignUpComponent - unit style", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  it("short-circuits if the user is already logged in", () => {
    renderWithCtx({ id: "u1", username: "alice" });
    expect(screen.getByText(/you are already logged in/i)).toBeInTheDocument();
  });

  it("shows the empty form when no user exists", () => {
    renderWithCtx();
    expect(screen.getByRole("form", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password:$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit sign up form/i })
    ).toBeInTheDocument();
  });

  it("validates blank submission and surfaces three error messages", async () => {
    renderWithCtx();
    fireEvent.click(
      screen.getByRole("button", { name: /submit sign up form/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/please enter in a username/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/please enter in a password/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/please enter in an email/i)).toBeInTheDocument();
    });
  });

  it("rejects a password mismatch", async () => {
    renderWithCtx();
    fireEvent.change(screen.getByLabelText(/username:/i), {
      target: { value: "demo" },
    });
    fireEvent.change(screen.getByLabelText(/^password:$/i), {
      target: { value: "one" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password:$/i), {
      target: { value: "two" },
    });
    fireEvent.change(screen.getByLabelText(/^email:$/i), {
      target: { value: "demo@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /submit sign up form/i })
    );

    await waitFor(() =>
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    );
  });

  it("submits valid data and shows the success message", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "newUser" }),
    });

    renderWithCtx();
    fireEvent.change(screen.getByLabelText(/username:/i), {
      target: { value: "validUser" },
    });
    fireEvent.change(screen.getByLabelText(/^password:$/i), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password:$/i), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByLabelText(/^email:$/i), {
      target: { value: "valid@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /submit sign up form/i })
    );

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        /welcome to the family/i
      )
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/signup$/),
      expect.any(Object)
    );
  });

  it("shows a server-side error message when signup fails", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "User already exists" }),
    });

    renderWithCtx();
    fireEvent.change(screen.getByLabelText(/username:/i), {
      target: { value: "taken" },
    });
    fireEvent.change(screen.getByLabelText(/^password:$/i), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password:$/i), {
      target: { value: "secret" },
    });
    fireEvent.change(screen.getByLabelText(/^email:$/i), {
      target: { value: "taken@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /submit sign up form/i })
    );

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        /user already exists/i
      )
    );
  });
});
