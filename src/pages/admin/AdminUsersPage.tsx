import { useMemo, useState } from 'react';
import { Search, ShieldCheck, UserX } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { DataTable, type Column } from '@/components/admin/AdminTable';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useToast } from '@/components/common/Feedback';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchUsers } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDateTime } from '@/utils/cn';
import type { AdminUserRow } from '@/types/domain';

export default function AdminUsersPage() {
  useDocumentTitle('Admin — users');
  const { toast } = useToast();
  const { data, loading, error, reload } = useAsync(() => fetchUsers(), []);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | 'citizen' | 'admin'>('all');

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.filter((user) => {
      if (role !== 'all' && user.role !== role) return false;
      if (!term) return true;
      return [user.name, user.email].join(' ').toLowerCase().includes(term);
    });
  }, [data, search, role]);

  const columns: Column<AdminUserRow>[] = [
    {
      key: 'name',
      header: 'User',
      cell: (user) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink-900">{user.name}</p>
          <p className="truncate text-xs text-ink-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (user) => (
        <Badge tone={user.role === 'admin' ? 'brand' : 'neutral'}>
          {user.role === 'admin' && <ShieldCheck className="size-3" aria-hidden="true" />}
          {user.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <Badge tone={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'warning'}>
          {user.status}
        </Badge>
      ),
    },
    { key: 'language', header: 'Language', cell: (user) => <span className="text-xs uppercase">{user.preferredLanguage}</span>, hideBelow: 'md' },
    {
      key: 'last',
      header: 'Last active',
      cell: (user) => <span className="text-xs tabular">{user.lastActiveAt === '—' ? '—' : formatDateTime(user.lastActiveAt)}</span>,
      hideBelow: 'lg',
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Users" description="Citizen and administrator accounts. Role changes require an administrator and are written to the audit log." />

      <InlineNotice tone="info" title="Least privilege">
        <p>
          The frontend hides admin routes from ordinary users, but the backend must re-check the role on every admin
          request. Suspending an account must revoke its sessions.
        </p>
      </InlineNotice>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-ink-400" aria-hidden="true" />
          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-lg border border-brand-900/15 bg-white ps-9 pe-3 text-sm"
          />
        </div>
        <label htmlFor="user-role" className="sr-only">
          Filter by role
        </label>
        <select id="user-role" value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="h-10 rounded-lg border border-brand-900/15 bg-white px-2.5 text-sm sm:w-40">
          <option value="all">All roles</option>
          <option value="citizen">Citizens</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 shadow-bevel">
        <div className="border-b border-ink-100 px-3 py-2 text-xs text-ink-500" aria-live="polite">
          {loading ? 'Loading…' : `${rows.length} user(s)`}
        </div>
        {loading && <TableSkeleton />}
        {!loading && error && <div className="p-4"><ErrorState message={errorMessage(error)} onRetry={reload} /></div>}
        {!loading && !error && (
          <DataTable
            caption="Users"
            columns={columns}
            rows={rows}
            rowKey={(user) => user.id}
            empty={<EmptyState title="No users match" description="Adjust the filters." action={<Button variant="outline" onClick={() => { setSearch(''); setRole('all'); }}>Clear</Button>} />}
            actions={(user) => (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-700 hover:bg-red-50"
                onClick={() => toast(`Demonstration: suspension of ${user.name} is not persisted.`, 'info')}
                leadingIcon={<UserX className="size-3.5" aria-hidden="true" />}
              >
                Suspend
              </Button>
            )}
          />
        )}
      </div>
    </div>
  );
}
