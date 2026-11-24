import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, BookOpenCheck, ClipboardCheck, FileStack, MessageSquare } from 'lucide-react';
import { PageHeader, Stat } from '@/components/common/Feedback';
import { ReviewStatusBadge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchAdminServices, fetchAuditLog, fetchDashboardStats, fetchFeedback } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDateTime } from '@/utils/cn';

export default function AdminDashboardPage() {
  useDocumentTitle('Admin dashboard');

  const stats = useAsync(() => fetchDashboardStats(), []);
  const services = useAsync(() => fetchAdminServices(), []);
  const audit = useAsync(() => fetchAuditLog(), []);
  const feedback = useAsync(() => fetchFeedback(), []);

  const pending = services.data?.filter((s) => s.status === 'pending_review' || s.status === 'draft') ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Administration"
        title="Dashboard"
        description="The state of the knowledge base: what is published, what awaits review, and what has changed recently. Every published record must carry a source, a date checked and a reviewer."
      />

      <InlineNotice tone="warning" title="Demonstration environment">
        <p>
          This build renders demonstration records. Admin actions are simulated — they show the workflow and the
          interface states but do not persist changes. Publication is only ever allowed after review in the real
          system.
        </p>
      </InlineNotice>

      {stats.loading && <TableSkeleton rows={2} />}
      {stats.error && <ErrorState message={errorMessage(stats.error)} onRetry={stats.reload} />}
      {stats.data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Published services" value={stats.data.publishedServices} hint="Visible to citizens" tone="success" />
          <Stat label="Pending review" value={stats.data.pendingReviews} hint="Awaiting a reviewer" tone="warning" />
          <Stat label="Sources awaiting review" value={stats.data.sourcesAwaitingReview} hint="Linked to records" />
          <Stat label="Open feedback" value={stats.data.openFeedback} hint="Corrections and reports" />
          <Stat label="Active users" value={stats.data.activeUsers} hint="Citizens and administrators" />
          <Stat label="Records needing re-check" value={stats.data.staleRecords} hint="Demo or overdue" tone="warning" />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          title="Awaiting review"
          description="Records that cannot be published until a reviewer records a source and date checked."
          action={
            <Link to="/admin/services" className="text-xs font-medium text-brand-800 hover:underline">
              All services
            </Link>
          }
          flush
        >
          {services.loading && <TableSkeleton rows={3} />}
          {services.error && <div className="p-4"><ErrorState message={errorMessage(services.error)} onRetry={services.reload} /></div>}
          {services.data && pending.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-ink-500">Nothing is waiting for review.</p>
          )}
          {services.data && pending.length > 0 && (
            <ul className="divide-y divide-ink-100">
              {pending.slice(0, 5).map((service) => (
                <li key={service.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{service.name}</p>
                    <p className="text-xs text-ink-500">{service.department}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ReviewStatusBadge status={service.status} />
                    <Link
                      to={`/admin/services/${service.id}`}
                      className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-800"
                      aria-label={`Review ${service.name}`}
                    >
                      <ArrowRight className="size-4 dir-arrow" aria-hidden="true" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent changes"
          description="Audit entries record the previous and new value of every change."
          action={
            <Link to="/admin/audit-logs" className="text-xs font-medium text-brand-800 hover:underline">
              Full log
            </Link>
          }
          flush
        >
          {audit.loading && <TableSkeleton rows={3} />}
          {audit.error && <div className="p-4"><ErrorState message={errorMessage(audit.error)} onRetry={audit.reload} /></div>}
          {audit.data && (
            <ul className="divide-y divide-ink-100">
              {audit.data.slice(0, 5).map((entry) => (
                <li key={entry.id} className="px-4 py-2.5">
                  <p className="text-sm text-ink-800">
                    <span className="font-medium">{entry.actor}</span> {entry.action.toLowerCase()}
                  </p>
                  <p className="text-xs text-ink-500">
                    {entry.entityLabel} · {formatDateTime(entry.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/admin/knowledge-base', label: 'Review workflow', icon: ClipboardCheck },
          { to: '/admin/sources', label: 'Approve sources', icon: FileStack },
          { to: '/admin/services', label: 'Manage services', icon: BookOpenCheck },
          { to: '/admin/feedback', label: 'Citizen feedback', icon: MessageSquare },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-white p-3.5 text-sm font-medium text-ink-800 hover:border-brand-300"
          >
            <item.icon className="size-4 text-brand-700" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </div>

      {feedback.data && feedback.data.some((f) => f.status !== 'resolved') && (
        <InlineNotice tone="info" title="Feedback awaiting action" action={
          <Link to="/admin/feedback" className="text-xs font-semibold underline">
            Open feedback queue
          </Link>
        }>
          <p className="flex items-center gap-1.5">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            {feedback.data.filter((f) => f.status !== 'resolved').length} item(s) still need a response.
          </p>
        </InlineNotice>
      )}
    </div>
  );
}
