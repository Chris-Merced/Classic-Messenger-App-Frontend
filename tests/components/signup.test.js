import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SignUpComponent from '../../src/components/signup';
import { UserContext } from '../../src/context/userContext';


//Tests have been made in tandem with the use of ChatGPT
//This test suite is to validate critical application functionality
//  and avoid regression
describe('SignUpComponent (core behaviors)', () => {
  let userContext;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
  });

  const renderWithContext = (overrideUser) => {
    userContext = { user: overrideUser || null, login: jest.fn(), logout: jest.fn() };
    return render(
      <MemoryRouter>
        <UserContext.Provider value={userContext}>
          <SignUpComponent />
        </UserContext.Provider>
      </MemoryRouter>
    );
  };

  it('shows "You are already logged in" when user is present', () => {
    renderWithContext({ id: 'u1', username: 'test' });
    expect(screen.getByText(/You are already logged in/i)).toBeInTheDocument();
  });

  it('renders the signup form when no user is present', () => {
    renderWithContext();
    expect(screen.getByRole('form', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email:$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit sign up form/i })).toBeInTheDocument();
  });

  it('validates empty fields and shows error messages on submit', async () => {
    renderWithContext();
    fireEvent.click(screen.getByRole('button', { name: /Submit sign up form/i }));
    await waitFor(() => {
      expect(screen.getByText(/Please enter in a username/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter in a password/i)).toBeInTheDocument();
      expect(screen.getByText(/Please enter in an email/i)).toBeInTheDocument();
    });
  });

  it('validates password mismatch and shows appropriate error', async () => {
    renderWithContext();
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'validUser' } });
    fireEvent.change(screen.getByLabelText(/^Password:$/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password:$/i), { target: { value: 'password2' } });
    fireEvent.change(screen.getByLabelText(/^Email:$/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit sign up form/i }));
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('validates invalid username format and shows error', async () => {
    renderWithContext();
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'invalid user!' } });
    fireEvent.change(screen.getByLabelText(/^Password:$/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password:$/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/^Email:$/i), { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit sign up form/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/Please enter in a valid username \(One word, can contain numbers\)/i)
      ).toBeInTheDocument();
    });
  });

  it('submits valid data and shows "Welcome to the Family" on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'newUser' }) });
    renderWithContext();
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'validUser' } });
    fireEvent.change(screen.getByLabelText(/^Password:$/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password:$/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/^Email:$/i), { target: { value: 'valid@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit sign up form/i }));
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/Welcome to the Family/i);
    });
  });

  it('displays server error message when signup fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'User already exists' }) });
    renderWithContext();
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'validUser' } });
    fireEvent.change(screen.getByLabelText(/^Password:$/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/^Confirm Password:$/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/^Email:$/i), { target: { value: 'valid@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit sign up form/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/User already exists/i);
    });
  });
});
