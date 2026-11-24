/**
 * Citizen area shell. Guarded by RequireAuth; provides the section tabs used by
 * every dashboard page so navigation stays consistent.
 */
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bookmark, FileText, History, LayoutDashboard, UserRound } from 'lucide-react';
import { RequireAuth } from '@/routes/guards';
import { useAuth } from '@/contexts/AuthContext';
import { cn, initials } from '@/utils/cn';

const tabs = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/drafts', label: 'Drafts', icon: FileText },
  { to: '/dashboard/saved-services', label: 'Saved services', icon: Bookmark },
  { to: '/dashboard/history', label: 'History', icon: History },
  { to: '/profile', label: 'Profile & settings', icon: UserRound },
];

export default function DashboardLayout() {
  return (
    <RequireAuth>
      <DashboardShell />
    </RequireAuth>
  );
}

function DashboardShell() {
  const { user } = useAuth();
  const location = useLocation();
  const activeTab = tabs.find((tab) =>
    tab.end ? location.pathname === tab.to : location.pathname.startsWith(tab.to),
  );

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 place-items-center rounded-full bg-brand-900 text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {user ? initials(user.name) : 'SA'}
          </span>
          <div>
            <p className="text-xs text-ink-500">Citizen area</p>
            <h1 className="text-lg font-semibold tracking-tight text-ink-950">{user?.name ?? 'Your dashboard'}</h1>
          </div>
        </div>
        <p className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[0.6875rem] text-ink-500">
          Demonstration session — data is stored in this browser
        </p>
      </div>

      <nav aria-label="Dashboard sections" className="mt-4 overflow-x-auto scrollbar-slim">
        <ul className="flex gap-1">
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-brand-900 text-white' : 'text-ink-600 hover:bg-ink-100',
                  )
                }
              >
                <tab.icon className="size-4" aria-hidden="true" />
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        <span className="sr-only" aria-live="polite">
          {activeTab?.label} section loaded
        </span>
        <Outlet />
      </div>
    </div>
  );
}
