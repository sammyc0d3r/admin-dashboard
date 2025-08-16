import { render, screen, waitFor } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import Dashboard from '../components/Dashboard/Dashboard';
import { AuthContext } from '../context/AuthContext';
import { ColorModeContext } from '../ColorModeContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../utils/api', () => ({
  apiFetch: vi.fn((endpoint) => {
    if (endpoint === '/auth/admin/dashboard') {
      return Promise.resolve({
        total_users: 1,
        active_users_24h: 1,
        total_cvs_analyzed: 0,
        successful_analyses: 0,
        failed_analyses: 0,
        average_processing_time: 0,
        top_fields: [],
        recent_errors: [],
      });
    }
    if (endpoint === '/auth/admin/me') {
      return Promise.resolve({ username: 'admin', role: 'super_admin' });
    }
    return Promise.resolve({});
  }),
}));

test('renders dashboard heading', async () => {
  render(
    <AuthContext.Provider value={{ logout: vi.fn(), isAuthenticated: true }}>
      <ColorModeContext.Provider value={{ toggleColorMode: vi.fn() }}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </ColorModeContext.Provider>
    </AuthContext.Provider>
  );
  await waitFor(() => expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument());
});
