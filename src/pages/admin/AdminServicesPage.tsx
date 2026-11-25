import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Filter, Pencil, Search, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { ReviewStatusBadge, VerificationBadge } from '@/components/common/Badge';
import { Button, LinkButton } from '@/components/common/Button';
import { DataTable, type Column } from '@/components/admin/AdminTable';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { setServiceStatus } from '@/services/api/admin';
import { fetchAdminServices } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { useToast } from '@/components/common/Feedback';
import { formatDate } from '@/utils/cn';
import type { ReviewStatus, Service } from '@/types/domain';

export default function AdminServicesPage() {
  useDocumentTitle('Admin — services');
  const { toast } = useToast();
  const { data, loading, error, reload } = useAsync(() => fetchAdminServices(), []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ReviewStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.filter((service) => {
      if (statusFilter !== 'all' && service.status !== statusFilter) return false;
      if (!term) return true;
      return [service.name, service.department, service.jurisdiction].join(' ').toLowerCase().includes(term);
    });
  }, [data, search, statusFilter]);

  const transition = async (service: Service, status: ReviewStatus) => {
    setBusyId(service.id);
    try {
      await setServiceStatus(service.id, status);
      toast(`Demonstration: "${service.name}" marked as ${status.replace('_', ' ')}. Changes are not persisted.`, 'info');
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<Service>[] = [
    {
      key: 'service',
      header: 'Service',
      cell: (service) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{service.name}</p>
          <p className="truncate text-xs text-ink-500">{service.category}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      cell: (service) => <span className="text-xs">{service.department}</span>,
      hideBelow: 'lg',
    },
    {
      key: 'jurisdiction',
      header: 'Jurisdiction',
      cell: (service) => <span className="text-xs">{service.jurisdiction}</span>,
      hideBelow: 'md',
    },
    {
      key: 'verification',
      header: 'Verification',
      cell: (service) => <VerificationBadge status={service.verification} showIcon={false} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (service) => <ReviewStatusBadge status={service.status} />,
    },
    {
      key: 'checked',
      header: 'Last checked',
      cell: (service) => (
        <span className="text-xs tabular">{service.lastVerifiedAt ? formatDate(service.lastVerifiedAt) : '—'}</span>
      ),
      hideBelow: 'lg',
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Services"
        description="Create, review, publish, archive and disable service records. A record cannot be published without a source, a date checked and a reviewer."
        actions={<LinkButton to="/admin/knowledge-base" variant="outline" size="sm" leadingIcon={<ShieldCheck className="size-4" aria-hidden="true" />}>Review workflow</LinkButton>}
      />

      <InlineNotice tone="info" title="Publishing rule">
        <p>
          Publish only after the record matches an official source and the source entry records the publisher, the
          URL and the date checked. Use Archive to withdraw a record without deleting its history.
        </p>
      </InlineNotice>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="admin-service-search" className="sr-only">
            Search services
          </label>
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
          <input
            id="admin-service-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service, department or jurisdiction…"
            className="h-10 w-full rounded-lg border border-brand-900/15 bg-white ps-9 pe-3 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="size-4 text-ink-400" aria-hidden="true" />
          <label htmlFor="admin-status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-10 rounded-lg border border-brand-900/15 bg-white px-2.5 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 shadow-bevel">
        <div className="flex items-center justify-between gap-2 border-b border-ink-100 px-3 py-2">
          <p className="text-xs text-ink-500" aria-live="polite">
            {loading ? 'Loading…' : `${rows.length} record(s)`}
          </p>
        </div>

        {loading && <TableSkeleton />}
        {!loading && error && <div className="p-4"><ErrorState message={errorMessage(error)} onRetry={reload} /></div>}
        {!loading && !error && (
          <DataTable
            caption="Service records"
            columns={columns}
            rows={rows}
            rowKey={(service) => service.id}
            empty={
              <EmptyState
                title="No records match"
                description="Clear the search or status filter to see all service records."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            }
            actions={(service) => (
              <div className="flex flex-wrap items-center justify-end gap-1">
                <LinkButton to={`/services/${service.slug}`} variant="ghost" size="sm" aria-label={`View ${service.name} on the public site`}>
                  <Eye className="size-3.5" aria-hidden="true" />
                </LinkButton>
                <LinkButton to={`/admin/services/${service.id}`} variant="ghost" size="sm" aria-label={`Edit ${service.name}`}>
                  <Pencil className="size-3.5" aria-hidden="true" />
                </LinkButton>
                <label className="sr-only" htmlFor={`status-${service.id}`}>
                  Change status for {service.name}
                </label>
                <select
                  id={`status-${service.id}`}
                  value={service.status}
                  disabled={busyId === service.id}
                  onChange={(e) => void transition(service, e.target.value as ReviewStatus)}
                  className="h-8 rounded-md border border-brand-900/15 bg-white px-1.5 text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_review">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}
          />
        )}
      </div>

      <p className="text-xs text-ink-500">
        Prefer the review workflow?{' '}
        <Link to="/admin/knowledge-base" className="font-medium text-brand-800 hover:underline">
          Open the knowledge-base review board
        </Link>{' '}
        for the draft → pending → approved → published path.
      </p>
    </div>
  );
}
