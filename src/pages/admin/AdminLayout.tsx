/**
 * Administrator area shell.
 * Guarded by RequireAdmin; navigation is deliberately separate from the public
 * header so admin tooling is never visible to ordinary users.
 */
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from '@/components/common/BrandMark';
import {
  BookOpenCheck,
  ClipboardList,
  FileStack,
  Gauge,
  HeartHandshake,
  LayoutDashboard,
  LifeBuoy,
  ListOrdered,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  Building2,
  BriefcaseBusiness,
  Users,
  Menu,
  X,
} from 'lucide-react';
import { RequireAdmin } from '@/routes/guards';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/utils/cn';

const navGroups: { label: string; items: { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean }[] }[] = [
  {
    label: 'Overview',
    items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Knowledge base',
    items: [
      { to: '/admin/services', label: 'Services', icon: BookOpenCheck },
      { to: '/admin/requirements', label: 'Requirements', icon: ClipboardList },
      { to: '/admin/procedures', label: 'Procedures', icon: ListOrdered },
      { to: '/admin/sources', label: 'Sources', icon: FileStack },
      { to: '/admin/knowledge-base', label: 'Review workflow', icon: ShieldCheck },
    ],
  },
  {
    label: 'Public records',
    items: [
      { to: '/admin/welfare', label: 'Welfare schemes', icon: HeartHandshake },
      { to: '/admin/emergency', label: 'Emergency contacts', icon: LifeBuoy },
      { to: '/admin/offices', label: 'Offices', icon: Building2 },
      { to: '/admin/lawyers', label: 'Lawyer directory', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
      { to: '/admin/audit-logs', label: 'Audit logs', icon: ScrollText },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function AdminLayout() {
  return (
    <RequireAdmin>
      <AdminShell />
    </RequireAdmin>
  );
}

function AdminShell() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <nav aria-label="Admin sections" className="space-y-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-2 text-[0.625rem] font-semibold uppercase tracking-wider text-ink-400">{group.label}</p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                      isActive ? 'bg-brand-900 text-white' : 'text-ink-700 hover:bg-ink-100',
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh surface-page">
      {/* Admin bar — the same night-green command surface as the hero, so the
          admin area reads as part of the same product rather than a bolted-on
          dashboard. */}
      <div className="relative sticky top-0 z-30 overflow-hidden bg-brand-950 text-white shadow-3">
        <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-30" aria-hidden="true" />
        <div className="container-page relative flex h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BrandMark className="size-7" />
            <div>
              <p className="text-[0.8125rem] font-semibold leading-none">Sahara AI</p>
              <p className="mt-1 text-[0.5625rem] font-medium uppercase tracking-[0.14em] text-sand-300/60">
                Administration
              </p>
            </div>
            <span className="ms-1 hidden rounded-full border border-white/15 bg-white/[0.07] px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-wider text-sand-200/80 sm:inline">
              Review workflow
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="hidden text-xs text-sand-100/70 sm:block">{user?.name}</p>
            <NavLink
              to="/"
              className="rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-sand-100 transition-colors hover:bg-white/[0.12] hover:text-white"
            >
              Exit to site
            </NavLink>
            <button
              type="button"
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="admin-mobile-nav"
              aria-label={mobileOpen ? 'Close admin navigation' : 'Open admin navigation'}
            >
              {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[15rem_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-brand-900/[0.07] bg-paper p-2 shadow-1 shadow-bevel">{sidebar}</div>
        </aside>

        {mobileOpen && (
          <div id="admin-mobile-nav" className="rounded-xl border border-brand-900/[0.07] bg-paper p-2 shadow-1 lg:hidden">
            {sidebar}
          </div>
        )}

        <main id="admin-main" className="min-w-0">
          <span key={location.pathname} className="sr-only" aria-live="polite">
            Admin page loaded
          </span>
          <Outlet />
        </main>
      </div>

      {import.meta.env.DEV && (
        <div className="container-page pb-4 text-[0.625rem] text-ink-400">
          Route guard active · backend must re-authorise every admin request
          <Gauge className="ms-1 inline size-3" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
