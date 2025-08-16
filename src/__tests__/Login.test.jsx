import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import '@testing-library/jest-dom';
import Login from '../components/Login/Login';
import { AuthContext } from '../context/AuthContext';

vi.mock('../utils/api', () => ({
  apiFetch: vi.fn(() => Promise.resolve({ access_token: 'token' })),
}));

test('logs in and calls context login', async () => {
  const login = vi.fn();
  render(
    <AuthContext.Provider value={{ login }}>
      <Login />
    </AuthContext.Provider>
  );

  fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'admin' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => expect(login).toHaveBeenCalledWith('token'));
});

test('toggles password visibility', () => {
  render(
    <AuthContext.Provider value={{ login: vi.fn() }}>
      <Login />
    </AuthContext.Provider>
  );

  const passwordField = screen.getByLabelText(/password/i);
  const toggle = screen.getByLabelText(/show password/i);

  expect(passwordField).toHaveAttribute('type', 'password');
  fireEvent.click(toggle);
  expect(passwordField).toHaveAttribute('type', 'text');
  fireEvent.click(toggle);
  expect(passwordField).toHaveAttribute('type', 'password');
});
