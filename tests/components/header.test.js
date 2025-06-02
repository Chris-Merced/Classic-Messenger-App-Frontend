import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HeaderComponent from "../../src/components/header";
import { UserContext } from "../../src/context/userContext";
import { UserChatsContext } from "../../src/context/chatListContext";


//Tests have been made in tandem with the use of ChatGPT
//This test suite is to validate critical application functionality
//  and avoid regression
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
    Link: ({ to, children, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe("HeaderComponent", () => {
  let userContext;
  let chatContext;

  beforeAll(() => {
    delete window.location;
    window.location = { reload: jest.fn(), href: "" };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    document.body.classList.remove("light-theme");

    userContext = {
      user: null,
      login: jest.fn().mockResolvedValue({}),
      logout: jest.fn(),
    };
    chatContext = {
      resetChatList: jest.fn(),
    };

    global.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ friendRequests: [] }) });
  });

  const renderHeader = (userOverride) => {
    if (userOverride !== undefined) {
      userContext.user = userOverride;
    }
    return render(
      <UserContext.Provider value={userContext}>
        <UserChatsContext.Provider value={chatContext}>
          <HeaderComponent />
        </UserChatsContext.Provider>
      </UserContext.Provider>
    );
  };

  it("renders login form when no user is present", () => {
    renderHeader();
    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Log In$/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Signup/i })).toBeInTheDocument();
  });

  it("handles login submission and clears username input", async () => {
    renderHeader();
    fireEvent.change(screen.getByLabelText(/Username:/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Log In$/i }));

    await waitFor(() => {
      expect(userContext.login).toHaveBeenCalledWith({
        username: "testuser",
        password: "password123",
      });
    });
    expect(screen.getByLabelText(/Username:/i)).toHaveValue("");
  });

  it("toggles theme and updates body class and localStorage", () => {
    renderHeader();
    const toggleBtn = screen.getByLabelText(/Toggle theme/i);

    fireEvent.click(toggleBtn);
    expect(document.body.classList.contains("light-theme")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");

    fireEvent.click(toggleBtn);
    expect(document.body.classList.contains("light-theme")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("handles logout: context.logout, resetChatList, navigate, and reload", async () => {
    const mockResp = (data) => ({ json: async () => data });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockResp({ friendRequests: [] }))
      .mockResolvedValueOnce(mockResp({}));

    renderHeader({ id: 1, username: "johndoe" });
    fireEvent.click(screen.getByLabelText(/User options/i));
    fireEvent.click(screen.getByRole("menuitem", { name: /Log Out/i }));

    await waitFor(() => {
      expect(userContext.logout).toHaveBeenCalled();
      expect(chatContext.resetChatList).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("searches for users and displays results", async () => {
    const mockUsers = [{ id: 42, username: "alice" }];
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: async () => ({ friendRequests: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ users: mockUsers }) });

    renderHeader({ id: 1, username: "johndoe" });
    const input = screen.getByPlaceholderText(/Search Users/i);
    fireEvent.change(input, { target: { value: "ali" } });

    expect(await screen.findByText("alice")).toBeInTheDocument();
  });

  it("navigates to profile on Enter key", async () => {
    const mockUsers = [{ id: 99, username: "bob" }];
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ json: async () => ({ friendRequests: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ users: mockUsers }) });

    renderHeader({ id: 1, username: "johndoe" });
    const input = screen.getByPlaceholderText(/Search Users/i);
    fireEvent.change(input, { target: { value: "bob" } });
    await screen.findByText("bob");

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith("/userProfile/99");
  });
});
