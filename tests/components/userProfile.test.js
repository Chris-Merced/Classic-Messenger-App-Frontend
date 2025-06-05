import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserProfile from "../../src/components/userProfile";
import { UserContext } from "../../src/context/userContext";

beforeAll(() => {
  process.env.REACT_APP_BACKEND_URL = "/api";

  global.fetch = jest.fn((endpoint) => {
    if (
      typeof endpoint === "string" &&
      endpoint.startsWith("/api/userProfile/publicProfile")
    ) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              id: "999",
              username: "otherUser",
              created_at: "2025-01-01T12:34:56.000Z",
              about_me: "Hello there!",
            },
          }),
      });
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
});

afterEach(() => {
  global.fetch.mockClear();
});

afterAll(() => {
  delete process.env.REACT_APP_BACKEND_URL;
  global.fetch.mockRestore();
});

describe("UserProfile Unit Tests", () => {
  test("shows “No user logged in” when context has no user", () => {
    const { getByRole } = render(
      <MemoryRouter>
        <UserContext.Provider value={{ user: null }}>
          <UserProfile />
        </UserContext.Provider>
      </MemoryRouter>
    );

    expect(getByRole("alert")).toHaveTextContent("No user logged in");
  });

  test("hits /userProfile/publicProfile exactly once when a user is logged in", async () => {
    const fakeUser = { id: "123", username: "currentUser" };

    render(
      <MemoryRouter initialEntries={["/profile/otherUser"]}>
        <Routes>
          {}
          <Route
            path="/profile/:userIdentifier"
            element={
              <UserContext.Provider value={{ user: fakeUser }}>
                <UserProfile />
              </UserContext.Provider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/userProfile/publicProfile?ID=otherUser",
        expect.any(Object)
      )
    );
  });
});
