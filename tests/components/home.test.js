import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import WebSocketComponent from '../../src/components/home';
import { UserContext } from '../../src/context/userContext';
import { WebsocketContext } from '../../src/context/websocketContext';
import { UserChatsContext } from '../../src/context/chatListContext';

describe('WebSocketComponent', () => {
  let mockSocket;
  const mockUser = {
    id: '123',
    username: 'testuser',
  };

  const mockChat = {
    name: 'main',
    conversationID: 'test-convo-id',
  };

  beforeEach(() => {
    mockSocket = {
      current: {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
        close: jest.fn(),
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null,
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({
        messages: [
          {
            user: 'olduser',
            message: 'Previous message',
            time: '2024-01-01T12:00:00.000Z',
            conversationName: 'main',
          },
        ],
      }),
    });

    process.env.REACT_APP_BACKEND_URL = 'http://test-api';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = async (userOverrides = {}, chatOverrides = {}) => {
    const userContext = {
      user: userOverrides === null ? null : { ...mockUser, ...userOverrides },
    };

    const chatContext = {
      currentChat: { ...mockChat, ...chatOverrides },
    };

    let result;
    await act(async () => {
      result = render(
        <UserContext.Provider value={userContext}>
          <WebsocketContext.Provider value={mockSocket}>
            <UserChatsContext.Provider value={chatContext}>
              <MemoryRouter>
                <WebSocketComponent />
              </MemoryRouter>
            </UserChatsContext.Provider>
          </WebsocketContext.Provider>
        </UserContext.Provider>
      );
    });
    return result;
  };

  it('loads and displays initial messages', async () => {
    await renderComponent();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `http://test-api/messages/byChatName?chatName=${mockChat.name}&conversationID=${mockChat.conversationID}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
    });

    const messageElement = await screen.findByText('Previous message');
    expect(messageElement).toBeInTheDocument();
  });

  it('allows sending messages when user is logged in', async () => {
    const { getByRole } = await renderComponent();

    const input = getByRole('textbox');
    const sendButton = getByRole('button', { name: /send message/i });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Hello World' } });
    });

    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(mockSocket.current.send).toHaveBeenCalledWith(
      expect.stringContaining('"message":"Hello World"')
    );
    expect(input.value).toBe('');
  });

  it('handles incoming websocket messages', async () => {
    await renderComponent();

    await act(async () => {
      mockSocket.current.onmessage({
        data: JSON.stringify({
          message: 'New message',
          user: 'testuser',
          time: new Date().toISOString(),
          conversationName: 'main',
        }),
      });
    });

    await waitFor(() => {
      const messageElements = screen.getAllByText(/new message/i);
      expect(messageElements.length).toBeGreaterThan(0);
    });
  });

  it('does not show message form when user is not logged in', async () => {
    await renderComponent(null);

    const form = screen.queryByRole('form');
    expect(form).not.toBeInTheDocument();
  });

  it('formats message timestamps correctly', async () => {
    await renderComponent();

    const testDate = new Date('2024-01-01T15:30:00.000Z');

    await act(async () => {
      mockSocket.current.onmessage({
        data: JSON.stringify({
          message: 'Time test message',
          user: 'testuser',
          time: testDate.toISOString(),
          conversationName: 'main',
        }),
      });
    });

    await waitFor(() => {
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2} [AP]M/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('only displays messages for main conversation', async () => {
    await renderComponent();

    await act(async () => {
      mockSocket.current.onmessage({
        data: JSON.stringify({
          message: 'Main conversation',
          user: 'testuser',
          time: new Date().toISOString(),
          conversationName: 'main',
        }),
      });

      mockSocket.current.onmessage({
        data: JSON.stringify({
          message: 'Other conversation',
          user: 'testuser',
          time: new Date().toISOString(),
          conversationName: 'other',
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Main conversation')).toBeInTheDocument();
      expect(screen.queryByText('Other conversation')).not.toBeInTheDocument();
    });
  });
});
