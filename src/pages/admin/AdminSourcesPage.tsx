import { useMemo, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge, ReviewStatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { DataTable, type Column } from '@/components/admin/AdminTable';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchAdminServices } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDate } from '@/utils/cn';
import type { ReviewStatus, SourceRecord } from '@/types/domain';

interface SourceRow {
  source: SourceRecord;
  serviceName: string;
  serviceId: string;
}

const statusOptions: ReviewStatus[] = ['pending_review', 'approved', 'rejected', 'archived'];

export default function AdminSourcesPage() {
  useDocumentTitle('Admin — sources');
  const { data, loading, error, reload } = useAsync(() => fetchAdminServices(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | ReviewStatus>('all');

  const rows = useMemo<SourceRow[]>(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data
      .flatMap((service) =>
        service.sources.map((source) => ({ source, serviceName: service.name, serviceId: service.id })),
      )
      .filter((row) => {
        if (status !== 'all' && row.source.status !== status) return false;
        if (!term) return true;
        return [row.source.title, row.source.publisher, row.serviceName].join(' ').toLowerCase().includes(term);
      });
  }, [data, search, status]);

  const columns: Column<SourceRow>[] = [
    {
      key: 'title',
      header: 'Source',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{row.source.title}</p>
          <p className="truncate text-xs text-ink-500">{row.serviceName}</p>
        </div>
      ),
    },
    {
      key: 'publisher',
      header: 'Publisher',
      cell: (row) => <span className="text-xs">{row.source.publisher}</span>,
      hideBelow: 'md',
    },
    {
      key: 'url',
      header: 'URL',
      cell: (row) =>
        row.source.url ? (
          <a href={row.source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-brand-800 hover:underline">
            Open <ExternalLink className="size-2.5" aria-hidden="true" />
          </a>
        ) : (
          <Badge tone="warning">Not recorded</Badge>
        ),
      hideBelow: 'lg',
    },
    {
      key: 'checked',
      header: 'Date checked',
      cell: (row) => (
        <span className="text-xs tabular">{row.source.checkedAt ? formatDate(row.source.checkedAt) : '—'}</span>
      ),
    },
    {
      key: 'reviewer',
      header: 'Reviewer',
      cell: (row) => <span className="text-xs">{row.source.reviewer ?? '—'}</span>,
      hideBelow: 'lg',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <ReviewStatusBadge status={row.source.status} />,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sources"
        description="Each source records the title, publisher, URL, date checked, reviewer and review status. A record cannot be approved without an approved source."
      />

      <InlineNotice tone="warning" title="A source needs all four facts">
        <p>
          Title, publisher, URL and date checked. If any is missing, the source stays in Pending review and the
          citizen-facing page tells the reader the record is unverified.
        </p>
      </InlineNotice>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="source-search" className="sr-only">
            Search sources
          </label>
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
          <input
            id="source-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by source, publisher or service…"
            className="h-10 w-full rounded-lg border border-ink-300 bg-white ps-9 pe-3 text-sm"
          />
        </div>
        <div>
          <label htmlFor="source-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="source-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 w-full rounded-lg border border-ink-300 bg-white px-2.5 text-sm sm:w-48"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-3 py-2 text-xs text-ink-500" aria-live="polite">
          {loading ? 'Loading…' : `${rows.length} source(s)`}
        </div>
        {loading && <TableSkeleton />}
        {!loading && error && <div className="p-4"><ErrorState message={errorMessage(error)} onRetry={reload} /></div>}
        {!loading && !error && (
          <DataTable
            caption="Sources"
            columns={columns}
            rows={rows}
            rowKey={(row) => row.source.id}
            empty={
              <EmptyState
                title="No sources match"
                description="Adjust the search or status filter."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            }
          />
        )}
      </div>
    </div>
  );
}
