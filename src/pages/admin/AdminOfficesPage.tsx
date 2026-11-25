import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { DataTable, type Column } from '@/components/admin/AdminTable';
import { Button } from '@/components/common/Button';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchOfficesAdmin } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDate } from '@/utils/cn';
import type { PublicOffice } from '@/types/domain';

export default function AdminOfficesPage() {
  useDocumentTitle('Admin — offices');
  const { data, loading, error, reload } = useAsync(() => fetchOfficesAdmin(), []);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((office) => [office.name, office.city, office.district].join(' ').toLowerCase().includes(term));
  }, [data, search]);

  const columns: Column<PublicOffice>[] = [
    {
      key: 'name',
      header: 'Office',
      cell: (office) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{office.name}</p>
          <p className="text-xs text-ink-500">{office.category}</p>
        </div>
      ),
    },
    { key: 'city', header: 'City / district', cell: (office) => <span className="text-xs">{office.city}, {office.district}</span> },
    {
      key: 'address',
      header: 'Address',
      cell: (office) => <span className="text-xs">{office.address ?? '—'}</span>,
      hideBelow: 'lg',
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (office) => <span className="text-xs">{office.phone ?? '—'}</span>,
      hideBelow: 'md',
    },
    {
      key: 'checked',
      header: 'Last checked',
      cell: (office) => (
        <span className="text-xs tabular">
          {office.source.lastVerifiedAt ? formatDate(office.source.lastVerifiedAt) : '—'}
        </span>
      ),
      hideBelow: 'lg',
    },
    { key: 'verification', header: 'Verification', cell: (office) => <VerificationBadge status={office.verification} showIcon={false} /> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Offices" description="The curated directory behind the Office Finder. Address, phone and opening hours are published only when verified." />

      <InlineNotice tone="info" title="Location data">
        <p>
          Coordinates are stored only when confirmed, because the map and the Directions button both depend on them.
          An office without coordinates shows “Map location not recorded”.
        </p>
      </InlineNotice>

      <div className="relative">
        <label htmlFor="office-admin-search" className="sr-only">
          Search offices
        </label>
        <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
        <input
          id="office-admin-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search office, city or district…"
          className="h-10 w-full rounded-lg border border-brand-900/15 bg-white ps-9 pe-3 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 shadow-bevel">
        <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2">
          <p className="text-xs text-ink-500" aria-live="polite">
            {loading ? 'Loading…' : `${rows.length} office(s)`}
          </p>
          <Badge tone="warning">All entries pending verification</Badge>
        </div>
        {loading && <TableSkeleton />}
        {!loading && error && <div className="p-4"><ErrorState message={errorMessage(error)} onRetry={reload} /></div>}
        {!loading && !error && (
          <DataTable
            caption="Offices"
            columns={columns}
            rows={rows}
            rowKey={(office) => office.id}
            empty={
              <EmptyState
                title="No offices match"
                description="Try another search term."
                action={<Button variant="outline" onClick={() => setSearch('')}>Clear search</Button>}
              />
            }
          />
        )}
      </div>
    </div>
  );
}
