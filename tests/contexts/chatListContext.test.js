import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserChatsContext, UserChats } from '../../src/context/chatListContext';
import { UserContext } from '../../src/context/userContext';

global.fetch = jest.fn();

process.env.REACT_APP_BACKEND_URL = 'http://test-api';

describe('ChatList Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display chat list when user context is available', async () => {
    const mockChats = [
      { id: 1, title: 'Chat 1' },
      { id: 2, title: 'Chat 2' },
    ];

    fetch.mockResolvedValueOnce({
      json: async () => mockChats,
    });

    const TestComponent = () => {
      const { chatList } = React.useContext(UserChatsContext);
      return <div data-testid="chat-list">{JSON.stringify(chatList)}</div>;
    };

    render(
      <UserContext.Provider value={{ user: { id: 'test-user-id' } }}>
        <UserChats>
          <TestComponent />
        </UserChats>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://test-api/messages/userChats?userID=test-user-id',
        {
          method: 'GET',
          credentials: 'include',
        }
      );
    });

    await waitFor(() => {
      const element = screen.getByTestId('chat-list');
      expect(element).toHaveTextContent(JSON.stringify(mockChats));
    });
  });

  it('should not fetch chats when user context is missing', async () => {
    const TestComponent = () => {
      const { chatList } = React.useContext(UserChatsContext);
      return <div data-testid="chat-list">{JSON.stringify(chatList)}</div>;
    };

    render(
      <UserContext.Provider value={null}>
        <UserChats>
          <TestComponent />
        </UserChats>
      </UserContext.Provider>
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    const element = screen.getByTestId('chat-list');
    expect(element).toHaveTextContent('null');

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('API Error');
    fetch.mockRejectedValueOnce(mockError);
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <UserContext.Provider value={{ user: { id: 'test-user-id' } }}>
        <UserChats>
          <div data-testid="test-child">Test Child</div>
        </UserChats>
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting user chats: ' + mockError
      );
    });

    consoleSpy.mockRestore();
  });
});
