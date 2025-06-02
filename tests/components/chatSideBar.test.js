import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import SideBarComponent from "../../src/components/chatSidebar";
import { UserChatsContext } from "../../src/context/chatListContext";
import { UserContext } from "../../src/context/userContext";


//Tests have been made in tandem with the use of ChatGPT
//This test suite is to validate critical application functionality
//  and avoid regression
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/chats" }),
}));

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (msg, ...args) => {
    if (typeof msg === "string" && msg.includes("not wrapped in act")) return;
    originalConsoleError(msg, ...args);
  };
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe("SideBarComponent", () => {
  const mockChangeChat = jest.fn();
  const mockChangeChatList = jest.fn();
  const mockChangeLocation = jest.fn();

  const chatsData = {
    userChats: [
      {
        name: "Chat Alpha",
        id: 1,
        conversation_id: "alpha123",
        participants: ["alice", "bob"],
        is_read: false,
      },
      {
        name: "Chat Beta",
        id: 2,
        conversation_id: "beta456",
        participants: ["alice", "charlie"],
        is_read: true,
      },
    ],
  };

  const userCtx = {
    user: { id: 1, name: "Alice" },
    hasInitializedRef: { current: false },
  };

  beforeAll(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ activeUsers: {} }),
    });
  });
  afterAll(() => {
    global.fetch.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderSidebar = () => {
    return render(
      <UserContext.Provider value={userCtx}>
        <UserChatsContext.Provider
          value={{
            chatList: chatsData,
            changeChat: mockChangeChat,
            changeChatList: mockChangeChatList,
            changeLocation: mockChangeLocation,
          }}
        >
          <SideBarComponent />
        </UserChatsContext.Provider>
      </UserContext.Provider>
    );
  };

  it("renders all chats from context", async () => {
    await act(async () => {
      renderSidebar();
    });

    expect(await screen.findByText("Chat Alpha")).toBeInTheDocument();
    expect(screen.getByText("Chat Beta")).toBeInTheDocument();
  });

  it("shows an unread-indicator only for unread chats", async () => {
    await act(async () => {
      renderSidebar();
    });
    await screen.findByText("Chat Alpha");

    const dots = screen.getAllByLabelText("Unread messages");
    expect(dots).toHaveLength(1);
  });

  it("does not filter out named chats when typing in search (current behavior)", async () => {
    await act(async () => {
      renderSidebar();
    });
    await screen.findByText("Chat Alpha");

    const searchInput = screen.getByRole("searchbox", {
      name: /search chats/i,
    });
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    expect(screen.getByText("Chat Alpha")).toBeInTheDocument();
    expect(screen.getByText("Chat Beta")).toBeInTheDocument();
  });

  it("calls changeChat and marks as read when a chat is clicked", async () => {
    await act(async () => {
      renderSidebar();
    });
    const alphaBtn = await screen.findByText("Chat Alpha");
    fireEvent.click(alphaBtn);

    expect(mockChangeChat).toHaveBeenCalledWith({
      conversationID: "alpha123",
      reciever: ["alice", "bob"],
      name: "Chat Alpha",
    });

    expect(mockChangeChatList).toHaveBeenCalled();
    const updated = mockChangeChatList.mock.calls[0][0];
    const clicked = updated.userChats.find(
      (c) => c.conversation_id === "alpha123"
    );
    expect(clicked.is_read).toBe(true);
  });
});
