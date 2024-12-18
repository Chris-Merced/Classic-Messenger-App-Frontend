import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserProvider, UserContext } from '../../src/context/userContext';

const TestComponent = () => {
  const context = React.useContext(UserContext);
  return (
    <div>
      {context.loading && <div>Loading...</div>}
      {context.error && <div>Error: {context.error}</div>}
      {context.user && <div>User: {context.user.username}</div>}
      <button onClick={() => context.logout()}>Logout</button>
      <button
        onClick={() => context.login({ username: 'test', password: 'test' })}
      >
        Login
      </button>
    </div>
  );
};

describe('UserProvider', () => {
  let originalFetch;
  let originalEnv;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalEnv = process.env;

    global.fetch = jest.fn();
    process.env = {
      ...process.env,
      REACT_APP_BACKEND_URL: 'http://localhost:3000',
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('provides initial loading state', async () => {
    
    let fetchResolve;
    const fetchPromise = new Promise((resolve) => {
      fetchResolve = resolve;
    });

    global.fetch.mockImplementationOnce(() => fetchPromise);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    
    await act(async () => {
      fetchResolve({
        ok: true,
        json: () => Promise.resolve({ user: { username: 'testuser' } }),
      });
    });

    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('fetches and sets user data on mount', async () => {
    const mockUser = { username: 'testuser', id: '123' };

    
    let fetchResolve;
    const fetchPromise = new Promise((resolve) => {
      fetchResolve = resolve;
    });

    global.fetch.mockImplementationOnce(() => fetchPromise);

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    
    await act(async () => {
      fetchResolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      });
    });

    
    await waitFor(() => {
      expect(
        screen.getByText(`User: ${mockUser.username}`)
      ).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/userProfile',
      {
        method: 'GET',
        credentials: 'include',
      }
    );
  });

  
  it('handles fetch error correctly', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
      })
    );

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Error: Unauthorized or session expired')
      ).toBeInTheDocument();
    });
  });

  it('handles network error correctly', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('handles login successfully', async () => {
    const mockUser = { username: 'testuser', id: '123' };

    
    let profileFetchResolve;
    const profileFetchPromise = new Promise((resolve) => {
      profileFetchResolve = resolve;
    });

    global.fetch
      .mockImplementationOnce(() => profileFetchPromise)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        })
      );

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    
    await act(async () => {
      profileFetchResolve({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      });
    });

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    
    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(
        screen.getByText(`User: ${mockUser.username}`)
      ).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const mockUser = { username: 'testuser', id: '123' };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })
    );

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(`User: ${mockUser.username}`)
      ).toBeInTheDocument();
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(
        screen.queryByText(`User: ${mockUser.username}`)
      ).not.toBeInTheDocument();
    });
  });

  it('maintains user state across context consumers', async () => {
    const mockUser = { username: 'testuser', id: '123' };
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })
    );

    const AnotherTestComponent = () => {
      const { user } = React.useContext(UserContext);
      return user ? <div>Another view: {user.username}</div> : null;
    };

    render(
      <UserProvider>
        <TestComponent />
        <AnotherTestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(`User: ${mockUser.username}`)
      ).toBeInTheDocument();
      expect(
        screen.getByText(`Another view: ${mockUser.username}`)
      ).toBeInTheDocument();
    });
  });
});
