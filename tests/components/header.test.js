import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import HeaderComponent from '../../src/components/header';
import { UserContext } from '../../src/context/userContext';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HeaderComponent', () => {
  const mockContext = {
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  };

  const renderComponent = (contextOverrides = {}) => {
    const mergedContext = { ...mockContext, ...contextOverrides };

    return render(
      <UserContext.Provider value={mergedContext}>
        <MemoryRouter>
          <HeaderComponent />
        </MemoryRouter>
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form when no user is logged in', () => {
    renderComponent();

    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Go To Signup/i })
    ).toBeInTheDocument();
  });

  it('handles login submission', async () => {
    const mockLogin = jest.fn().mockResolvedValue({});
    renderComponent({ login: mockLogin });

    fireEvent.change(screen.getByLabelText(/Username:/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('renders user info when logged in', () => {
    const user = { username: 'johndoe' };
    renderComponent({ user });

    expect(screen.getByText(`Hello ${user.username}`)).toBeInTheDocument();
    expect(screen.getByText(/Drop-Down/i)).toBeInTheDocument();
  });

  it('toggles dropdown menu', () => {
    const user = { username: 'johndoe' };
    renderComponent({ user });

    fireEvent.click(screen.getByText(/Drop-Down/i));
    expect(screen.getByText(/User Menu:/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Out/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Drop-Down/i));
    expect(screen.queryByText(/User Menu:/i)).not.toBeInTheDocument();
  });

  it('handles logout', async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({}),
      ok: true,
    });

    const user = { username: 'johndoe' };
    const mockLogout = jest.fn();
    renderComponent({
      user,
      logout: mockLogout,
    });

    fireEvent.click(screen.getByText(/Drop-Down/i));
    fireEvent.click(screen.getByText(/Log Out/i));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('searches for users', async () => {
    const mockUsers = [
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
    ];
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ users: mockUsers }),
      ok: true,
    });

    const user = { username: 'johndoe' };
    renderComponent({ user });

    const searchInput = screen.getByPlaceholderText(/Search Users/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });
});
