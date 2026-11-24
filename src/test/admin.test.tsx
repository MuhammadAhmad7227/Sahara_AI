import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/test/testUtils';
import { login } from '@/services/api/auth';
import { resetMockFailures } from '@/services/api/client';
import AdminServicesPage from '@/pages/admin/AdminServicesPage';
import AdminSourcesPage from '@/pages/admin/AdminSourcesPage';
import AdminLayout from '@/pages/admin/AdminLayout';
import LoginPage from '@/pages/auth/LoginPage';

beforeEach(() => resetMockFailures());

function renderAdmin(ui: React.ReactElement) {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<p>Forbidden page</p>} />
      <Route path="/dashboard" element={<p>Citizen dashboard</p>} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<p>Admin index</p>} />
        <Route path="services" element={ui} />
      </Route>
    </Routes>,
    { route: '/admin/services' },
  );
}

describe('Admin route protection', () => {
  it('redirects a guest to the login page', async () => {
    renderAdmin(<AdminServicesPage />);
    expect(await screen.findByRole('heading', { name: /Log in to Sahara AI/i })).toBeInTheDocument();
  });

  it('sends a signed-in citizen to the forbidden page', async () => {
    await login({ email: 'citizen@sahara.demo', password: 'demo1234' });
    renderAdmin(<AdminServicesPage />);
    expect(await screen.findByText(/Forbidden page/i)).toBeInTheDocument();
  });

  it('allows an administrator and renders the service table', async () => {
    await login({ email: 'admin@sahara.demo', password: 'demo1234' });
    renderAdmin(<AdminServicesPage />);

    expect(await screen.findByRole('heading', { name: /^Services$/i }, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getAllByText(/Domicile Certificate/).length).toBeGreaterThan(0);
    expect(screen.getByRole('combobox', { name: /Filter by status/i })).toBeInTheDocument();
  });
});

describe('Source management', () => {
  it('lists sources with their review status and missing URLs', async () => {
    await login({ email: 'admin@sahara.demo', password: 'demo1234' });
    renderWithProviders(
      <Routes>
        <Route path="/forbidden" element={<p>Forbidden page</p>} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="sources" element={<AdminSourcesPage />} />
        </Route>
      </Routes>,
      { route: '/admin/sources' },
    );

    expect(await screen.findByRole('heading', { name: /^Sources$/i })).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByText(/Domicile certificate procedure/i).length).toBeGreaterThan(0),
    );
    expect(screen.getAllByText(/Not recorded/i).length).toBeGreaterThan(0);
  });

  it('filters sources by status', async () => {
    await login({ email: 'admin@sahara.demo', password: 'demo1234' });
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="sources" element={<AdminSourcesPage />} />
        </Route>
      </Routes>,
      { route: '/admin/sources' },
    );

    await waitFor(() =>
      expect(screen.getAllByText(/Domicile certificate procedure/i).length).toBeGreaterThan(0),
    );
    await user.selectOptions(screen.getByLabelText(/Filter by status/i), 'approved');
    await waitFor(() =>
      expect(screen.queryByText(/Domicile certificate procedure/i)).not.toBeInTheDocument(),
    );
  });
});
