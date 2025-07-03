import React from "react";
import {
  render,
  fireEvent,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import HomeChatComponent from "../../src/components/home";
import { UserContext } from "../../src/context/userContext";
import { WebsocketContext } from "../../src/context/websocketContext";
import { UserChatsContext } from "../../src/context/chatListContext";

const mockUser = { id: "u1", username: "alice" };
const mockChat = {
  name: "main",
  conversationID: "conv1",
  reciever: ["bob"],
  page: 0,
  limit: 20,
};
const backendURL = "/api";
const initialPayload = {
  messages: [
    {
      user: "olduser",
      message: "Welcome!",
      time: "2024-01-01T12:00:00.000Z",
      conversationName: "main",
      conversationID: "conv1",
      userID: "olduserID",
    },
  ],
};

const buildSocket = () => ({
  current: {
    readyState: WebSocket.OPEN,
    send: jest.fn(),
    onmessage: null,
    onopen: null,
  },
});

const renderHome = (user = mockUser) => {
  const socketRef = buildSocket();
  const chatContext = {
    currentChat: mockChat,
    chatList: { userChats: [] },
    changeChatList: jest.fn(),
  };

  return {
    socketRef,
    ...render(
      <MemoryRouter>
        <UserContext.Provider value={{ user }}>
          <WebsocketContext.Provider value={socketRef}>
            <UserChatsContext.Provider value={chatContext}>
              <HomeChatComponent />
            </UserChatsContext.Provider>
          </WebsocketContext.Provider>
        </UserContext.Provider>
      </MemoryRouter>
    ),
  };
};

beforeEach(() => {
  process.env.REACT_APP_BACKEND_URL = backendURL;

  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => initialPayload })
    .mockResolvedValue({ ok: true, json: async () => ({}) });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("fetches messages for the current chat twice on mount", async () => {
  renderHome();

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[0][0]).toBe(
      `${backendURL}/messages/byChatName?chatName=${mockChat.name}` +
        `&conversationID=${mockChat.conversationID}&userID=${mockUser.id}&page=${mockChat.page}&limit=${mockChat.limit}`
    );
  });

  expect(await screen.findByText("Welcome!")).toBeInTheDocument();
});

test("sends a message over WebSocket and clears the text box", async () => {
  const { socketRef } = renderHome();

  const box = screen.getByRole("textbox", { name: /type your message/i });
  const send = screen.getByRole("button", { name: /send message/i });

  await act(async () => {
    fireEvent.change(box, { target: { value: "Hello there" } });
    fireEvent.click(send);
  });

  expect(socketRef.current.send).toHaveBeenCalledWith(
    expect.stringContaining('"message":"Hello there"')
  );
  expect(box.value).toBe("");
});

test("shows no “compose” form when no user is logged in", () => {
  renderHome(null);

  const form = screen.queryByRole("form", { name: /send a new message/i });
  expect(form).not.toBeInTheDocument();
});
