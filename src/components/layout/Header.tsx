/**
 * Global header.
 *  - Desktop: brand, primary links, two grouped dropdown menus, language, auth.
 *  - Mobile:  brand, "Ask AI" call-to-action, hamburger drawer.
 *  - Role-aware: citizens see Dashboard; administrators also see Admin. Admin is
 *    never present for ordinary users or guests.
 *  - Dropdowns are keyboard operable with Escape to close and outside-click close.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  FileText,
  Gauge,
  HeartHandshake,
  Landmark,
  LayoutDashboard,
  Menu,
  Scale,
  ShieldAlert,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { BrandLockup } from '@/components/common/BrandMark';
import { Button, LinkButton } from '@/components/common/Button';
import { LanguageMenu } from '@/components/common/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { cn, initials } from '@/utils/cn';
import { toolGroups, resourceLinks } from '@/components/layout/navigation';

const iconFor: Record<string, LucideIcon> = {
  '/applications': FileText,
  '/complaints': FileText,
  '/readiness': Gauge,
  '/scam-detector': ShieldAlert,
  '/documents': Upload,
  '/welfare': HeartHandshake,
  '/emergency': AlertTriangle,
  '/offices': Building2,
  '/legal': Scale,
  '/lawyers': BriefcaseBusiness,
  '/about': Landmark,
  '/feedback': UserRound,
};

function DesktopDropdown({ group }: { group: (typeof toolGroups)[number] }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const active = group.items.some((i) => location.pathname.startsWith(i.to));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium transition-colors',
          active ? 'text-brand-900' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
        )}
      >
        {t(group.labelKey)}
        <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          className="absolute start-0 z-50 mt-1.5 w-80 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-1.5 shadow-overlay animate-slide-up"
        >
          {group.items.map((item) => {
            const Icon = iconFor[item.to] ?? FileText;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-ink-50"
              >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-800" aria-hidden="true">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink-900">{t(item.labelKey)}</span>
                  {item.description && (
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{item.description}</span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full py-1 ps-1 pe-2.5 text-sm hover:bg-ink-100"
      >
        <span
          className="grid size-7 place-items-center rounded-full bg-brand-900 text-[0.6875rem] font-semibold text-white"
          aria-hidden="true"
        >
          {initials(user.name)}
        </span>
        <span className="hidden max-w-24 truncate font-medium text-ink-800 lg:inline">{user.name}</span>
        <ChevronDown className="size-3.5 text-ink-400" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-50 mt-1.5 w-60 rounded-xl border border-ink-200 bg-paper p-1.5 shadow-3 animate-slide-up"
        >
          <div className="border-b border-ink-100 px-2 pb-2 pt-1.5">
            <p className="truncate text-sm font-medium text-ink-900">{user.name}</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
            <p className="mt-1 inline-flex items-center gap-1 rounded bg-ink-100 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-ink-600">
              {user.role} · demo
            </p>
          </div>
          <Link
            to="/dashboard"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-100"
          >
            <LayoutDashboard className="size-4" aria-hidden="true" /> {t('nav.dashboard')}
          </Link>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-100"
          >
            <UserRound className="size-4" aria-hidden="true" /> {t('dashboard.profileSettings')}
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink-700 hover:bg-ink-100"
            >
              <ShieldAlert className="size-4" aria-hidden="true" /> {t('nav.admin')}
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="mt-0.5 flex w-full items-center gap-2 rounded-lg border-t border-ink-100 px-2 py-2 text-start text-sm text-ink-700 hover:bg-ink-100"
          >
            {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // The header gains a shadow once the page moves — it should feel attached to
  // the document, not pasted on top of it.
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  useDialogFocus(drawerOpen, drawerRef, () => setDrawerOpen(false), closeRef);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.key]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);



  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-ink-200 bg-white transition-shadow duration-200',
        scrolled && 'shadow-1',
      )}
    >
      <div className="border-b border-brand-800 bg-brand-950 text-sand-100">
        <div className="container-page py-2 text-xs font-medium leading-relaxed">
          {t('trust.notGovernment')}
        </div>
      </div>
      <div className="container-page flex min-h-18 items-center justify-between gap-3 py-2">
        <div className="flex items-center gap-1 lg:gap-4">
          <BrandLockup />

          <nav aria-label={t('nav.mainMenu')} className="hidden items-center gap-0.5 xl:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'relative inline-flex h-9 items-center rounded-lg px-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-ink-950'
                    : 'text-ink-600 hover:bg-ink-900/[0.04] hover:text-ink-950',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {t('nav.home')}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-2.5 -bottom-[1.35rem] h-0.5 rounded-full bg-accent-500"
                    />
                  )}
                </>
              )}
            </NavLink>
            <NavLink
              to="/services"
              className={({ isActive }) =>
                cn(
                  'relative inline-flex h-9 items-center rounded-lg px-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-ink-950' : 'text-ink-600 hover:bg-ink-900/[0.04] hover:text-ink-950',
                )
              }
            >
              {t('nav.services')}
            </NavLink>
            <NavLink
              to="/assistant"
              className={({ isActive }) =>
                cn(
                  'relative inline-flex h-9 items-center rounded-lg px-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-ink-950' : 'text-ink-600 hover:bg-ink-900/[0.04] hover:text-ink-950',
                )
              }
            >
              {t('nav.assistant')}
            </NavLink>
            {toolGroups.map((group) => (
              <DesktopDropdown key={group.labelKey} group={group} />
            ))}
            <DesktopDropdown
              group={{
                labelKey: 'nav.resources',
                label: 'Resources',
                items: resourceLinks,
              }}
            />
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:block">
            <LanguageMenu />
          </div>

          {isAuthenticated ? (
            <div className="hidden xl:block"><UserMenu /></div>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <LinkButton to="/login" variant="ghost" size="sm" className="hidden md:inline-flex">
                {t('nav.login')}
              </LinkButton>
              <LinkButton
                to="/assistant"
                variant="primary"
                size="sm"
                trailingIcon={<ArrowRight className="size-3.5 dir-arrow" aria-hidden="true" />}
              >
                {t('nav.talkToSahara')}
              </LinkButton>
            </div>
          )}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 hover:bg-ink-100 xl:hidden"
            aria-label={t('nav.menu')}
            aria-expanded={drawerOpen}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div className="absolute inset-0 bg-ink-950/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div
            ref={drawerRef}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-label={t('nav.siteNavigation')}
            className="absolute inset-y-0 end-0 flex w-[min(22rem,92vw)] flex-col border-s border-ink-200 bg-paper shadow-4 animate-slide-up"
          >
            <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-ink-200/80 px-4">
              <BrandLockup />
              <button
                ref={closeRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100"
                aria-label={t('nav.close')}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-slim px-3 py-4">
              <div className="mb-4 rounded-xl border border-brand-900/10 bg-brand-50/60 px-1">
                <LanguageMenu align="start" />
              </div>
              <nav aria-label={t('nav.mainMenu')}>
                <MobileSection title={t('nav.mainMenu')}>
                  <MobileLink to="/" icon={Landmark} label={t('nav.home')} />
                  <MobileLink to="/services" icon={Landmark} label={t('nav.services')} />
                  <MobileLink to="/assistant" icon={FileText} label={t('nav.assistant')} />
                </MobileSection>

                {toolGroups.map((group) => (
                  <MobileSection key={group.labelKey} title={t(group.labelKey)}>
                    {group.items.map((item) => (
                      <MobileLink
                        key={item.to}
                        to={item.to}
                        icon={iconFor[item.to] ?? FileText}
                        label={t(item.labelKey)}
                      />
                    ))}
                  </MobileSection>
                ))}

                <MobileSection title={t('nav.resources')}>
                  {resourceLinks.map((item) => (
                    <MobileLink key={item.to} to={item.to} icon={iconFor[item.to] ?? FileText} label={t(item.labelKey)} />
                  ))}
                </MobileSection>

                {isAuthenticated && (
                  <MobileSection title={t('nav.profile')}>
                    <MobileLink to="/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
                    <MobileLink to="/profile" icon={UserRound} label={t('nav.profile')} />
                    {user?.role === 'admin' && (
                      <MobileLink to="/admin" icon={ShieldAlert} label={t('nav.admin')} />
                    )}
                  </MobileSection>
                )}
              </nav>

              <div className="space-y-3 border-t border-ink-200 px-1 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <LinkButton to="/assistant" variant="primary" fullWidth>
                {t('nav.assistant')}
              </LinkButton>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDrawerOpen(false);
                      void logout().then(() => navigate('/', { replace: true }));
                    }}
                  >
                    {t('nav.logout')}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <LinkButton to="/login" variant="outline" size="sm">
                      {t('nav.login')}
                    </LinkButton>
                    <LinkButton to="/register" variant="primary" size="sm">
                      {t('nav.register')}
                    </LinkButton>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-ink-600">{title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MobileLink({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-2.5 text-sm font-medium',
          isActive ? 'bg-brand-50 text-brand-900' : 'text-ink-700 hover:bg-ink-100',
        )
      }
    >
      <Icon className="size-4 shrink-0 text-ink-400" aria-hidden="true" />
      {label}
    </NavLink>
  );
}
