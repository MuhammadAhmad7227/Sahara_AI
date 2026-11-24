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
      <section className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-ink-900">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}.</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-600">
          Your saved drafts, bookmarked services and tool history are shown here. In this development build they are
          stored in your browser; a signed-in account will keep them on the server.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <LinkButton key={action.to} to={action.to} variant="outline" size="sm" leadingIcon={<action.icon className="size-4" aria-hidden="true" />}>
              {action.label}
            </LinkButton>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/dashboard/drafts" className="rounded-xl border border-ink-200 bg-white p-4 shadow-card hover:border-brand-300">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Draft applications</p>
            <FileText className="size-4 text-ink-400" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular text-ink-900">{drafts.loading ? '—' : drafts.data?.length ?? 0}</p>
          <p className="text-xs text-ink-500">Prepared drafts stored locally</p>
        </Link>
        <Link to="/dashboard/saved-services" className="rounded-xl border border-ink-200 bg-white p-4 shadow-card hover:border-brand-300">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Saved services</p>
            <Bookmark className="size-4 text-ink-400" aria-hidden="true" />
          </div>
          <p className="mt-1 text-2xl font-semibold tabular text-ink-900">{saved.length}</p>
          <p className="text-xs text-ink-500">Bookmarked service records</p>
        </Link>
        <Link to="/dashboard/history" className="rounded-xl border border-ink-200 bg-white p-4 shadow-card hover:border-brand-300">
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
