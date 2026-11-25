import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bookmark,
  FileText,
  Gauge,
  History,
  MessagesSquare,
  PenLine,
  ShieldAlert,
} from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { EmptyState } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useSavedServices } from '@/hooks/useSavedServices';
import { useAuth } from '@/contexts/AuthContext';
import { listDrafts } from '@/services/api/applications';
import { formatDate } from '@/utils/cn';

const quickActions = [
  { to: '/assistant', label: 'Ask Sahara AI', icon: MessagesSquare },
  { to: '/applications', label: 'Generate application', icon: PenLine },
  { to: '/readiness', label: 'Check readiness', icon: Gauge },
  { to: '/scam-detector', label: 'Check a message', icon: ShieldAlert },
];

export default function DashboardHomePage() {
  const { user } = useAuth();
  const drafts = useAsync(() => listDrafts(), []);
  const { saved } = useSavedServices();

  const recentDrafts = drafts.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-5">
      {/* Command panel: the one place in the citizen area that carries the brand. */}
      <section className="relative overflow-hidden rounded-2xl panel-night p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -end-16 -top-20 size-56 rounded-full bg-accent-500/20 blur-[80px]"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-sand-300/70">
              <span className="h-px w-4 bg-accent-500" aria-hidden="true" />
              Sahara citizen centre
            </p>
            <h2 className="mt-2 text-[1.35rem] font-semibold leading-tight tracking-tight text-white sm:text-[1.6rem]">
              {user ? `Welcome back, ${user.name.split(' ')[0]}.` : 'Welcome back.'}
            </h2>
            <p className="mt-1.5 max-w-xl text-[0.8125rem] leading-relaxed text-brand-100/80">
              How can Sahara help you today? Your drafts, saved services and recent questions are below.
            </p>
          </div>
          <div className="shrink-0">
            <LinkButton
              to="/assistant"
              variant="secondary"
              trailingIcon={<ArrowRight className="size-4 dir-arrow" aria-hidden="true" />}
            >
              Talk to Sahara
            </LinkButton>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-2.5 py-2.5 text-start backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.11]"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-sand-100">
                <action.icon className="size-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 text-[0.75rem] font-medium leading-tight text-sand-50">
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        <p className="relative mt-3 text-[0.625rem] leading-relaxed text-sand-300/45">
          Development build — drafts, saved services and history are stored in this browser.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/dashboard/drafts" className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 shadow-card hover:border-brand-300">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Draft applications</p>
            <FileText className="size-4 text-ink-400" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular text-ink-900">{drafts.loading ? '—' : drafts.data?.length ?? 0}</p>
          <p className="text-xs text-ink-500">Prepared drafts stored locally</p>
        </Link>
        <Link to="/dashboard/saved-services" className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 shadow-card hover:border-brand-300">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Saved services</p>
            <Bookmark className="size-4 text-ink-400" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular text-ink-900">{saved.length}</p>
          <p className="text-xs text-ink-500">Bookmarked service records</p>
        </Link>
        <Link to="/dashboard/history" className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 shadow-card hover:border-brand-300">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Analyses</p>
            <History className="size-4 text-ink-400" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular text-ink-900">0</p>
          <p className="text-xs text-ink-500">Saved after sign-in is connected</p>
        </Link>
      </div>

      <SectionCard
        title="Recent drafts"
        description="Generated applications and complaints, stored in this browser."
        action={
          <LinkButton to="/dashboard/drafts" variant="ghost" size="sm">
            View all
          </LinkButton>
        }
      >
        {drafts.loading && <p className="text-sm text-ink-500">Loading drafts…</p>}
        {drafts.error && <p className="text-sm text-red-700">Drafts could not be loaded.</p>}
        {!drafts.loading && !drafts.error && recentDrafts.length === 0 && (
          <EmptyState
            icon={<FileText className="size-5" />}
            title="No drafts yet"
            description="Generate your first application or complaint draft and it will appear here."
            action={
              <LinkButton to="/applications" size="sm">
                Generate a draft
              </LinkButton>
            }
          />
        )}
        {!drafts.loading && recentDrafts.length > 0 && (
          <ul className="divide-y divide-ink-100">
            {recentDrafts.map((draft) => (
              <li key={draft.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{draft.templateName}</p>
                  <p className="text-xs text-ink-500">
                    {draft.department} · {formatDate(draft.createdAt)}
                  </p>
                </div>
                <Link to="/dashboard/drafts" className="shrink-0 text-xs font-medium text-brand-800 hover:underline">
                  Open <ArrowRight className="inline size-3 dir-arrow" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {saved.length > 0 && (
        <SectionCard
          title="Saved services"
          action={
            <LinkButton to="/dashboard/saved-services" variant="ghost" size="sm">
              View all
            </LinkButton>
          }
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {saved.slice(0, 4).map((service) => (
              <li key={service.slug}>
                <Link
                  to={`/services/${service.slug}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm hover:border-brand-300"
                >
                  <span className="truncate font-medium text-ink-800">{service.name}</span>
                  <span className="shrink-0 text-xs text-ink-500">{service.department}</span>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
