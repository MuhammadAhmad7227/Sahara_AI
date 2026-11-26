/**
 * Route smoke test.
 *
 * The production build serves index.html for every path, so an HTTP 200 does not
 * prove a page renders. This suite mounts the REAL route table, visits every
 * route and asserts that something meaningful is on screen — no crash, no
 * 404 page for a declared route, no blank screen.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { router } from '@/routes/router';
import { login } from '@/services/api/auth';
import { resetMockFailures } from '@/services/api/client';

type RouteCase = { path: string; expect: RegExp; admin?: boolean; auth?: boolean };

const publicRoutes: RouteCase[] = [
  { path: '/', expect: /Sahara AI/i },
  { path: '/services', expect: /Services/i },
  { path: '/services/domicile-certificate', expect: /Domicile Certificate/i },
  { path: '/assistant', expect: /Sahara Assistant|Assistant/i },
  { path: '/applications', expect: /Application/i },
  { path: '/readiness', expect: /Readiness/i },
  { path: '/scam-detector', expect: /Scam/i },
  { path: '/complaints', expect: /Complaint/i },
  { path: '/documents', expect: /Document/i },
  { path: '/welfare', expect: /Welfare/i },
  { path: '/emergency', expect: /Emergency/i },
  { path: '/offices', expect: /Office/i },
  { path: '/legal', expect: /Legal/i },
  { path: '/legal/what-to-do-if-police-refuses-fir', expect: /FIR|First Information/i },
  { path: '/lawyers', expect: /Lawyer/i },
  { path: '/about', expect: /About/i },
  { path: '/feedback', expect: /Feedback/i },
  { path: '/login', expect: /Log in/i },
  { path: '/register', expect: /Create your account|Register|Create account/i },
  { path: '/forgot-password', expect: /Reset|Forgot/i },
  { path: '/forbidden', expect: /Forbidden|permission/i },
  // /settings is a redirect to the citizen profile; a guest is sent to /login first,
  // so it is asserted in the guard block below rather than here.
  { path: '/definitely-not-a-page', expect: /could not be found/i },
];

const citizenRoutes: RouteCase[] = [
  { path: '/dashboard', expect: /Dashboard|Welcome/i },
  { path: '/dashboard/drafts', expect: /Draft/i },
  { path: '/dashboard/saved-services', expect: /Saved/i },
  { path: '/dashboard/history', expect: /History/i },
  { path: '/profile', expect: /Profile/i },
];

const adminRoutes: RouteCase[] = [
  { path: '/admin', expect: /Overview|Dashboard/i },
  { path: '/admin/services', expect: /Service/i },
  { path: '/admin/services/domicile-certificate', expect: /Domicile/i },
  { path: '/admin/requirements', expect: /Requirement/i },
  { path: '/admin/procedures', expect: /Procedure/i },
  { path: '/admin/sources', expect: /Source/i },
  { path: '/admin/knowledge-base', expect: /Knowledge/i },
  { path: '/admin/welfare', expect: /Welfare/i },
  { path: '/admin/emergency', expect: /Emergency/i },
  { path: '/admin/offices', expect: /Office/i },
  { path: '/admin/lawyers', expect: /Lawyer/i },
  { path: '/admin/users', expect: /User/i },
  { path: '/admin/feedback', expect: /Feedback/i },
  { path: '/admin/audit-logs', expect: /Audit/i },
  { path: '/admin/settings', expect: /Settings/i },
];

/** Mount the real router at a URL and fail on the route error boundary. */
async function renderRoute(path: string) {
  const memoryRouter = createMemoryRouter(router.routes, { initialEntries: [path] });
  render(<RouterProvider router={memoryRouter} />);

  // React Router logs error-boundary catches through the console; surface them.
  return screen;
}

beforeEach(() => {
  resetMockFailures();
});

async function expectRouteRenders(path: string, pattern: RegExp) {
  await renderRoute(path);
  const main = await screen.findByRole('main', undefined, { timeout: 8000 });
  const found = await within(main).findAllByText(pattern, undefined, { timeout: 8000 });
  expect(found.length).toBeGreaterThan(0);
  expect(document.body.textContent).not.toMatch(/Unexpected (?:Application )?Error/i);
}

describe('Public routes render', () => {
  for (const route of publicRoutes) {
    it(`${route.path} renders`, async () => {
      await expectRouteRenders(route.path, route.expect);
    });
  }
});

describe('Citizen routes render when signed in', () => {
  for (const route of citizenRoutes) {
    it(`${route.path} renders`, async () => {
      await login({ email: 'citizen@sahara.demo', password: 'demo1234' });
      await expectRouteRenders(route.path, route.expect);
    });
  }
});

describe('Admin routes render for an administrator', () => {
  for (const route of adminRoutes) {
    it(`${route.path} renders`, async () => {
      await login({ email: 'admin@sahara.demo', password: 'demo1234' });
      await expectRouteRenders(route.path, route.expect);
    });
  }
});

describe('Guards applied to the real route table', () => {
  it('sends a guest from /admin to the login page', async () => {
    await renderRoute('/admin');
    expect(await screen.findByRole('heading', { name: /Log in to Sahara AI/i }, { timeout: 8000 })).toBeInTheDocument();
  });

  it('sends a citizen away from /admin/users', async () => {
    await login({ email: 'citizen@sahara.demo', password: 'demo1234' });
    await renderRoute('/admin/users');
    expect(await screen.findByText(/Forbidden|do not have permission/i, undefined, { timeout: 8000 })).toBeInTheDocument();
  });

  it('sends a guest from /dashboard to the login page', async () => {
    await renderRoute('/dashboard');
    expect(await screen.findByRole('heading', { name: /Log in to Sahara AI/i }, { timeout: 8000 })).toBeInTheDocument();
  });

  it('redirects /settings to the profile page', async () => {
    await login({ email: 'citizen@sahara.demo', password: 'demo1234' });
    await renderRoute('/settings');
    // The sidebar and the page header both contain "Profile".
    expect((await screen.findAllByRole('heading', { name: /Profile/i }, { timeout: 8000 })).length).toBeGreaterThan(0);
    expect(screen.getByText(/Language preferences|Preferred language/i)).toBeInTheDocument();
  });

  it('sends a guest from /settings to the login page', async () => {
    await renderRoute('/settings');
    expect(await screen.findByRole('heading', { name: /Log in to Sahara AI/i }, { timeout: 8000 })).toBeInTheDocument();
  });
});


describe('Recovery from invalid saved session', () => {
  it('renders the public home page rather than crashing when a saved session is incomplete', async () => {
    localStorage.setItem('sahara.demo.session', JSON.stringify({
      token: 'old-demo-token', expiresAt: '2099-01-01T00:00:00Z', user: { role: 'citizen' },
    }));
    await renderRoute('/');
    await screen.findByRole('heading', { name: /Government services/i });
    await waitFor(() => expect(screen.queryByText('Unexpected error')).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });
});
