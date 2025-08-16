import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PrivateRoute } from '../App';

const renderWithAuth = (isAuthenticated) =>
  render(
    <AuthContext.Provider value={{ isAuthenticated }}>
      <MemoryRouter>
        <PrivateRoute>
          <div>Secret</div>
        </PrivateRoute>
      </MemoryRouter>
    </AuthContext.Provider>
  );

test('hides children when not authenticated', () => {
  renderWithAuth(false);
  expect(screen.queryByText('Secret')).toBeNull();
});

test('shows children when authenticated', () => {
  renderWithAuth(true);
  expect(screen.getByText('Secret')).toBeInTheDocument();
});
