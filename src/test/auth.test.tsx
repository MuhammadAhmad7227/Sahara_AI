import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import { currentSession, login } from '@/services/api/auth';
import { renderWithProviders } from '@/test/testUtils';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<p>Dashboard page</p>} />
    </Routes>,
    { route: '/login' },
  );
}

describe('Login form', () => {
  it('validates the email before submitting', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/^Email/), 'not-an-email');
    await user.type(screen.getByLabelText(/^Password/), 'demo1234');
    await user.click(screen.getByRole('button', { name: /^Log in$/ }));

    expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
  });

  it('shows the credential error for a wrong password', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/^Email/), 'citizen@sahara.demo');
    await user.type(screen.getByLabelText(/^Password/), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /^Log in$/ }));

    expect(await screen.findByText(/email or password you entered is not correct/i)).toBeInTheDocument();
  });

  it('signs in with the demo credentials and navigates to the dashboard', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/^Email/), 'citizen@sahara.demo');
    await user.type(screen.getByLabelText(/^Password/), 'demo1234');
    await user.click(screen.getByRole('button', { name: /^Log in$/ }));

    await waitFor(() => expect(screen.getByText('Dashboard page')).toBeInTheDocument());
  });
});

describe('Registration form', () => {
  it('reports mismatched passwords', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/register' });

    await user.type(screen.getByLabelText(/Full name/), 'Ayesha Khan');
    await user.type(screen.getByLabelText(/^Email/), 'ayesha@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'secret123');
    await user.type(screen.getByLabelText(/Confirm password/), 'secret999');
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('requires the responsible-use acknowledgement', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />, { route: '/register' });

    await user.type(screen.getByLabelText(/Full name/), 'Ayesha Khan');
    await user.type(screen.getByLabelText(/^Email/), 'ayesha@example.com');
    await user.type(screen.getByLabelText(/^Password/), 'secret123');
    await user.type(screen.getByLabelText(/Confirm password/), 'secret123');
    await user.click(screen.getByRole('button', { name: /Create account/i }));

    expect(
      await screen.findByText(/understand that Sahara AI provides information from reviewed public sources/i),
    ).toBeInTheDocument();
  });
});


describe('Stored demo sessions', () => {
  it.each([
    '{broken',
    JSON.stringify({ user: { role: 'citizen' }, token: 'demo', expiresAt: '2099-01-01' }),
    JSON.stringify({ user: { name: 'Demo', id: 'x', email: 'demo@example.com', role: 'citizen' }, token: 'demo', expiresAt: 'invalid' }),
    JSON.stringify({ user: { name: 'Demo', id: 'x', email: 'demo@example.com', role: 'citizen' }, token: 'demo', expiresAt: '2000-01-01' }),
  ])('ignores unusable session data', (raw) => {
    localStorage.setItem('sahara.demo.session', raw);
    expect(currentSession()).toBeNull();
  });

  it('restores a valid demo session', async () => {
    const session = await login({ email: 'citizen@sahara.demo', password: 'demo1234' });
    expect(currentSession()).toEqual(session);
  });
});
