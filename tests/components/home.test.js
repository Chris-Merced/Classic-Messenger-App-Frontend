import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HomeChatComponent from '../../src/components/home';
import { UserContext } from '../../src/context/userContext';
import { WebsocketContext } from '../../src/context/websocketContext';
import { UserChatsContext } from '../../src/context/chatListContext';

const formatTime = (isoString) =>
  new Date(isoString).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

describe('HomeChatComponent (core behaviors)', () => {
  let mockSocket;
  const mockUser = { id: 'u1', username: 'testuser' };
  const mockChat = { name: 'main', conversationID: 'conv-1', reciever: ['u1'] };

  beforeEach(() => {
    mockSocket = {
      current: {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
        onmessage: null,
        onopen: null,
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        messages: [
          {
            user: 'olduser',
            message: 'Welcome!',
            time: '2024-01-01T10:00:00.000Z',
            conversationName: 'main',
            conversationID: 'conv-1',
            userID: 'olduserID',
          },
        ],
      }),
    });

    process.env.REACT_APP_BACKEND_URL = 'http://fake-api';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContexts = async (userValue = mockUser, chatOverrides = {}) => {
    const userContext = { user: userValue };
    const chatContext = {
      currentChat: { ...mockChat, ...chatOverrides },
      chatList: { userChats: [] },
      changeChatList: jest.fn(),
    };

    let result;
    await act(async () => {
      result = render(
        <UserContext.Provider value={userContext}>
          <WebsocketContext.Provider value={mockSocket}>
            <UserChatsContext.Provider value={chatContext}>
              <MemoryRouter>
                <HomeChatComponent />
              </MemoryRouter>
            </UserChatsContext.Provider>
          </WebsocketContext.Provider>
        </UserContext.Provider>
      );
    });
    return { ...result, chatContext };
  };

  it('fetches and displays initial messages for the current chat', async () => {
    await renderWithContexts();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://fake-api/messages/byChatName?chatName=${mockChat.name}&conversationID=${mockChat.conversationID}&userID=${mockUser.id}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
    });

    const initialMsg = await screen.findByText('Welcome!');
    expect(initialMsg).toBeInTheDocument();
  });

  it('allows sending a new message via WebSocket and clears the input', async () => {
    const mockResp = (data, ok = true) => ({ ok, json: async () => data });
    global.fetch = jest.fn()
      .mockResolvedValueOnce(mockResp({
        messages: [
          {
            user: 'olduser',
            message: 'Welcome!',
            time: '2024-01-01T10:00:00.000Z',
            conversationName: 'main',
            conversationID: 'conv-1',
            userID: 'olduserID',
          },
        ],
      }))
      .mockResolvedValueOnce(mockResp({}));

    await renderWithContexts();

    const textbox = screen.getByRole('textbox', { name: /Type your message here/i });
    const sendButton = screen.getByRole('button', { name: /Send message/i });

    await act(async () => {
      fireEvent.change(textbox, { target: { value: 'Hello World' } });
      fireEvent.click(sendButton);
    });

    expect(mockSocket.current.send).toHaveBeenCalledWith(
      expect.stringContaining(`"message":"Hello World"`)
    );
    expect(textbox.value).toBe('');
  });

  it('appends incoming WebSocket messages for the same conversation only', async () => {
    await renderWithContexts();

    await screen.findByText('Welcome!');

    const newMsg = {
      user: 'otheruser',
      message: 'New in main',
      time: new Date().toISOString(),
      conversationName: 'main',
      conversationID: 'conv-1',
      userID: 'otheruserID',
    };

    await act(async () => {
      mockSocket.current.onmessage({ data: JSON.stringify(newMsg) });
    });

    const formatted = formatTime(newMsg.time);
    await waitFor(() => {
      expect(screen.getByText('New in main')).toBeInTheDocument();
      expect(screen.getByText(formatted)).toBeInTheDocument();
    });

    const otherConvMsg = { ...newMsg, message: 'Should not appear', conversationID: 'conv-2' };
    await act(async () => {
      mockSocket.current.onmessage({ data: JSON.stringify(otherConvMsg) });
    });

    expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
  });

  it('hides the message form when no user is logged in', async () => {
    await renderWithContexts(null);

    const form = screen.queryByRole('form', { name: /Send a new message/i });
    expect(form).not.toBeInTheDocument();
  });
});