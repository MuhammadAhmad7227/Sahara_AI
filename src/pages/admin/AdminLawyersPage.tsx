import { PageHeader } from '@/components/common/Feedback';
import { Badge } from '@/components/common/Badge';
import { DataTable, type Column } from '@/components/admin/AdminTable';
import { ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchLawyersAdmin } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import type { Lawyer } from '@/types/domain';

export default function AdminLawyersPage() {
  useDocumentTitle('Admin — lawyer directory');
  const { data, loading, error, reload } = useAsync(() => fetchLawyersAdmin(), []);

  const columns: Column<Lawyer>[] = [
    { key: 'name', header: 'Profile', cell: (lawyer) => <span className="font-medium text-ink-900">{lawyer.name}</span> },
    { key: 'city', header: 'City', cell: (lawyer) => <span className="text-xs">{lawyer.city}</span> },
    {
      key: 'spec',
      header: 'Specializations',
      cell: (lawyer) => (
        <span className="flex flex-wrap gap-1">
          {lawyer.specializations.map((s) => (
            <Badge key={s} tone="neutral">
              {s}
            </Badge>
          ))}
        </span>
      ),
      hideBelow: 'md',
    },
    {
      key: 'verification',
      header: 'Verification',
      cell: (lawyer) => (
        <Badge tone={lawyer.verificationStatus === 'verified' ? 'success' : lawyer.verificationStatus === 'unverified' ? 'warning' : 'neutral'}>
          {lawyer.verificationStatus}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Lawyer directory" description="Listings appear only with a documented verification method. Appointments and payments are out of scope for this release." />

      <InlineNotice tone="warning" title="Demonstration profiles">
        <p>
          The current rows are fictional, non-contactable demonstration profiles. No real lawyer is represented, and
          none can be shown as “verified” until a verification method is documented.
        </p>
      </InlineNotice>

      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
        <div className="border-b border-ink-100 px-3 py-2 text-xs text-ink-500">
          {loading ? 'Loading…' : `${data?.length ?? 0} listing(s)`}
        </div>
        {loading && <TableSkeleton />}
        {!loading && error && <div className="p-4"><ErrorState message={errorMessage(error)} onRetry={reload} /></div>}
        {!loading && !error && data && (
          <DataTable caption="Lawyer directory" columns={columns} rows={data} rowKey={(l) => l.id} empty={<p className="text-sm text-ink-500">No listings.</p>} />
        )}
      </div>
    </div>
  );
}
