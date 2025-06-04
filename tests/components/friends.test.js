import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import FriendRequests from '../../src/components/friends';
import { UserContext } from '../../src/context/userContext';

const fakeUser = { id: 123, username: 'me' };

const renderWithUser = (user) =>
  render(
    <MemoryRouter>
      <UserContext.Provider value={{ user }}>
        <FriendRequests />
      </UserContext.Provider>
    </MemoryRouter>
  );

beforeEach(() => {
  process.env.REACT_APP_BACKEND_URL = '/api';

  global.fetch = jest.fn((url) => {
    if (url.startsWith('/api/userProfile/friendRequest')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ friendRequests: [{ id: '20', username: 'Bob' }] }),
      });
    }
    if (url.startsWith('/api/userProfile/getFriends')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ friendsList: [{ id: '40', username: 'Alice' }] }),
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('FriendRequests Unit Testing', () => {
  test('shows login alert when no user is in context', () => {
    renderWithUser(null);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/log in/i);
  });

  test('fetches friend-requests & friends once each and renders lists', async () => {
    renderWithUser(fakeUser);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch.mock.calls[0][0]).toMatch(/friendRequest/);
      expect(global.fetch.mock.calls[1][0]).toMatch(/getFriends/);

      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  test('clicking “Friends” button hides and shows the friends UL', async () => {
    const { container } = renderWithUser(fakeUser);

    const toggleBtn = await screen.findByRole('button', { name: /friends/i });

    const list = container.querySelector('#friends-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass('show');

    fireEvent.click(toggleBtn);
    expect(list).toHaveClass('hide');

    fireEvent.click(toggleBtn);
    expect(list).toHaveClass('show');
  });
});