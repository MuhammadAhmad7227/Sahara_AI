import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge } from '@/components/common/Badge';
import { DataTable, type Column } from '@/components/admin/AdminTable';
import { Button } from '@/components/common/Button';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchAuditLog } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDateTime } from '@/utils/cn';
import type { AuditLogEntry } from '@/types/domain';

export default function AdminAuditLogsPage() {
  useDocumentTitle('Admin — audit logs');
  const { data, loading, error, reload } = useAsync(() => fetchAuditLog(), []);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((entry) =>
      [entry.actor, entry.action, entry.entityLabel, entry.entityType].join(' ').toLowerCase().includes(term),
    );
  }, [data, search]);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'actor',
      header: 'Actor',
      cell: (entry) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink-900">{entry.actor}</p>
          <p className="text-xs text-ink-500">{entry.actorRole}</p>
        </div>
      ),
    },
    { key: 'action', header: 'Action', cell: (entry) => <span className="text-sm">{entry.action}</span> },
    {
      key: 'entity',
      header: 'Entity',
      cell: (entry) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-800">{entry.entityLabel}</p>
          <Badge tone="neutral">{entry.entityType}</Badge>
        </div>
      ),
      hideBelow: 'md',
    },
    {
      key: 'change',
      header: 'Change',
      cell: (entry) =>
        entry.previousValue || entry.newValue ? (
          <span className="block max-w-56 text-xs">
            <span className="text-ink-500 line-through">{entry.previousValue ?? '—'}</span>
            <span aria-hidden="true"> → </span>
            <span className="font-medium text-ink-800">{entry.newValue ?? '—'}</span>
          </span>
        ) : (
          <span className="text-xs text-ink-400">—</span>
        ),
      hideBelow: 'lg',
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      cell: (entry) => <span className="whitespace-nowrap text-xs tabular">{formatDateTime(entry.timestamp)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Audit logs" description="Immutable record of changes to published information, with the previous and new value where available." />

      <InlineNotice tone="info" title="Why this matters for a civic platform">
        <p>
          If a citizen relied on a record, the project must be able to show who changed it, when, and what the record
          said before. Audit entries are append-only.
        </p>
      </InlineNotice>

      <div className="relative">
        <label htmlFor="audit-search" className="sr-only">
          Search audit log
        </label>
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
        <input
          id="audit-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by actor, action or record…"
          className="h-10 w-full rounded-lg border border-ink-300 bg-white ps-9 pe-3 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-3 py-2 text-xs text-ink-500" aria-live="polite">
          {loading ? 'Loading…' : `${rows.length} entr${rows.length === 1 ? 'y' : 'ies'}`}
        </div>
        {loading && <TableSkeleton />}
        {!loading && error && <div className="p-4"><ErrorState message={errorMessage(error)} onRetry={reload} /></div>}
        {!loading && !error && (
          <DataTable
            caption="Audit log"
            columns={columns}
            rows={rows}
            rowKey={(entry) => entry.id}
            empty={<EmptyState title="No audit entries match" description="Try another search term." action={<Button variant="outline" onClick={() => setSearch('')}>Clear search</Button>} />}
          />
        )}
      </div>
    </div>
  );
}
