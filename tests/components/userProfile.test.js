import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserProfile from '../../src/components/userProfile';
import { useParams } from 'react-router-dom';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderUserProfile = (userIdentifier) => {
    return render(
      <MemoryRouter initialEntries={[`/userProfile/${userIdentifier}`]}>
        <Routes>
          <Route
            path="/userProfile/:userIdentifier"
            element={<UserProfile />}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders user profile successfully when data is fetched', async () => {
    useParams.mockReturnValue({ userIdentifier: 'testUser' });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { username: 'testUserName', created_at: '2024-01-01' },
      }),
    });

    renderUserProfile('testUser');

    await waitFor(() => {
      expect(screen.getByText('Hello testUser ...')).toBeInTheDocument();
      expect(
        screen.getByText('Welcome to the page of testUserName')
      ).toBeInTheDocument();
      expect(screen.getByText('Created at 2024-01-01')).toBeInTheDocument();
    });
  });

  it('displays an error message when the fetch fails', async () => {
    useParams.mockReturnValue({ userIdentifier: 'testUser' });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch profile' }),
    });

    renderUserProfile('testUser');

    await waitFor(() => {
      expect(
        screen.getByText('Error occured on profile retrieval')
      ).toBeInTheDocument();
    });
  });
});
