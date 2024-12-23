import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideBarComponent from '../../src/components/chatSidebar';
import { UserChatsContext } from '../../src/context/chatListContext';

const mockChangeChat = jest.fn();
const mockUserChatsContext = {
  chatList: {
    userChats: [
      { name: 'Chat 1', id: 1, conversation_id: 'conv1' },
      { name: 'Chat 2', id: 2, conversation_id: 'conv2' },
    ],
  },
  changeChat: mockChangeChat,
};

const renderWithContext = (component, contextValue = mockUserChatsContext) => {
  return render(
    <UserChatsContext.Provider value={contextValue}>
      {component}
    </UserChatsContext.Provider>
  );
};

describe('SideBarComponent', () => {
  beforeEach(() => {
    mockChangeChat.mockClear();
  });

  it('should render loading state when no chats are available', () => {
    const noChatsContext = {
      chatList: null,
      changeChat: mockChangeChat,
    };
    renderWithContext(<SideBarComponent />, noChatsContext);
    expect(screen.getByText('loading ...')).toBeInTheDocument();
  });

  it('should render list of chats when available', () => {
    renderWithContext(<SideBarComponent />);
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
  });

  it('should call changeChat with correct chat data when clicked', () => {
    renderWithContext(<SideBarComponent />);
    const chatButton = screen.getByText('Chat 1');
    chatButton.click();
    expect(mockChangeChat).toHaveBeenCalledWith({
      name: 'Chat 1',
      conversationID: 'conv1',
    });
  });

  it('should render correct number of chat buttons', () => {
    renderWithContext(<SideBarComponent />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('should handle empty chat list correctly', () => {
    const emptyContext = {
      chatList: {
        userChats: [],
      },
      changeChat: mockChangeChat,
    };
    const { container } = renderWithContext(<SideBarComponent />, emptyContext);
    expect(container.querySelector('.sideBar')).toBeInTheDocument();
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  it('should update when context changes', () => {
    const { rerender } = renderWithContext(<SideBarComponent />);
    expect(screen.getByText('Chat 1')).toBeInTheDocument();

    const updatedContext = {
      chatList: {
        userChats: [{ name: 'New Chat', id: 3, conversation_id: 'conv3' }],
      },
      changeChat: mockChangeChat,
    };

    rerender(
      <UserChatsContext.Provider value={updatedContext}>
        <SideBarComponent />
      </UserChatsContext.Provider>
    );

    expect(screen.getByText('New Chat')).toBeInTheDocument();
    expect(screen.queryByText('Chat 1')).not.toBeInTheDocument();
  });
});
