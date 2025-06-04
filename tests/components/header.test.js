import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HeaderComponent from "../../src/components/header";
import { UserContext } from "../../src/context/userContext";
import { UserChatsContext } from "../../src/context/chatListContext";


process.env.REACT_APP_BACKEND_URL = "/api";

const fakeUserCtx = (user = null) => ({
  user,
  login: jest.fn().mockResolvedValue({}), 
  logout: jest.fn(),
});
const fakeChatCtx = { resetChatList: jest.fn() };

beforeAll(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  });
});

afterEach(() => {
  jest.clearAllMocks();
  document.body.classList.remove("light-theme");
});

const renderHeader = (
  user = null,
  initialPath = "/",
  ctx = fakeUserCtx(user)
) =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        {}
        <Route
          path="*"
          element={
            <UserContext.Provider value={ctx}>
              <UserChatsContext.Provider value={fakeChatCtx}>
                <HeaderComponent />
              </UserChatsContext.Provider>
            </UserContext.Provider>
          }
        />
      </Routes>
    </MemoryRouter>
  );


describe("HeaderComponent – minimal unit tests", () => {
  test("shows username / password inputs when no user", () => {
    const { getByLabelText } = renderHeader();
    expect(getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(getByLabelText(/Password:/i)).toBeInTheDocument();
  });

  test("submits login and clears username", async () => {
    const ctx = fakeUserCtx();
    const { getByLabelText, getByRole } = renderHeader(
      null, // user
      "/", // initialPath
      ctx // inject *this* context
    );

    fireEvent.change(getByLabelText(/Username:/i), {
      target: { value: "alice" },
    });
    fireEvent.change(getByLabelText(/Password:/i), {
      target: { value: "secret" },
    });
    fireEvent.click(getByRole("button", { name: /^log in$/i }));

    await waitFor(() =>
      expect(ctx.login).toHaveBeenCalledWith({
        username: "alice",
        password: "secret",
      })
    );
    expect(getByLabelText(/Username:/i)).toHaveValue(""); 
  });

  test("theme toggle adds & removes light-theme class", () => {
    const { getByLabelText } = renderHeader();
    const toggle = getByLabelText(/toggle theme/i);

    fireEvent.click(toggle); 
    expect(document.body).toHaveClass("light-theme");

    fireEvent.click(toggle); 
    expect(document.body).not.toHaveClass("light-theme");
  });

  test("fetches friend-requests exactly once when user exists", async () => {
    renderHeader({ id: 7, username: "bob" });

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(global.fetch.mock.calls[0][0]).toMatch(
      /\/api\/userProfile\/friendRequest\?userID=7/
    );
  });
});
