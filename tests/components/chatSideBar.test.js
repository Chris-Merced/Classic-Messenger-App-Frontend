import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SideBarComponent from "../../src/components/chatSidebar";
import { UserChatsContext } from "../../src/context/chatListContext";
import { UserContext } from "../../src/context/userContext";

jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/chats" }),
}));

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((msg, ...rest) => {
    if (typeof msg === "string" && msg.includes("not wrapped in act")) return;
    console.warn(msg, ...rest);
  });
  jest.useFakeTimers();
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ activeUsers: {} }),
  });
});

afterAll(() => {
  jest.useRealTimers();
  console.error.mockRestore();
  global.fetch.mockRestore();
});

const fakeChats = {
  userChats: [
    {
      name: "Chat Alpha",
      conversation_id: "alpha123",
      participants: ["alice", "bob"],
      is_read: false,
    },
    {
      name: "Chat Beta",
      conversation_id: "beta456",
      participants: ["alice", "charlie"],
      is_read: true,
    },
  ],
};

const renderSidebar = () =>
  render(
    <UserContext.Provider
      value={{
        user: { id: 1, name: "Alice" },
        hasInitializedRef: { current: false },
      }}
    >
      <UserChatsContext.Provider
        value={{
          chatList: fakeChats,
          changeChat: jest.fn(),
          changeChatList: jest.fn(),
          changeLocation: jest.fn(),
        }}
      >
        <SideBarComponent />
      </UserChatsContext.Provider>
    </UserContext.Provider>
  );

describe("SideBarComponent Unit Testing", () => {
  it("renders both chat buttons that come from context", async () => {
    renderSidebar();

    await screen.findByRole("button", { name: "Chat Alpha" });

    expect(
      screen.getByRole("button", { name: "Chat Alpha" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chat Beta" })
    ).toBeInTheDocument();
  });

  it("shows exactly one unread dot (only the unread chat)", async () => {
    renderSidebar();
    await screen.findByRole("button", { name: "Chat Alpha" });

    const unreadDots = screen.getAllByLabelText("Unread messages");
    expect(unreadDots).toHaveLength(1);
  });

  it("fires three /getOnlineUsers fetch for strict mode", async () => {
    renderSidebar();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
    expect(global.fetch.mock.calls[0][0]).toMatch(/\/getOnlineUsers\?/);
  });

  it("keeps both named chats visible when searching by name", async () => {
    renderSidebar();
    await screen.findByRole("button", { name: "Chat Alpha" });

    const searchBox = screen.getByRole("searchbox", { name: /search chats/i });
    fireEvent.change(searchBox, { target: { value: "Alpha" } });

    expect(
      screen.getByRole("button", { name: "Chat Alpha" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Chat Beta" })
    ).toBeInTheDocument();
  });
});
