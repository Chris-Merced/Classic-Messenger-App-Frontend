import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SignUpComponent from '../src/components/signup';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('SignUpComponent', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <SignUpComponent />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    renderComponent();

    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Assimilate/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Come Back Home/i })
    ).toBeInTheDocument();
  });

  it('shows validation errors when form is submitted with empty fields', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Assimilate/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter in a username/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Please enter in a password/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Please enter in an email/i)).toBeInTheDocument();
    });
  });

  it('handles successful signup', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Signup Successful' }),
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username:/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: 'test@example.com' },
    });

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: /Assimilate/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('Signup Successful:', {
      message: 'Signup Successful',
    });

    consoleLogSpy.mockRestore();
  });

  it('handles signup failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    });

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username:/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password:/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/Email:/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Assimilate/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Signup Failed:',
      400,
      'Bad Request'
    );

    consoleErrorSpy.mockRestore();
  });

  it('prevents signup when validation fails', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Username:/i), {
      target: { value: 'testuser' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Assimilate/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter in a password/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Please enter in an email/i)).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('has a link back to home page', () => {
    renderComponent();

    const homeLink = screen.getByRole('link', { name: /Come Back Home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
