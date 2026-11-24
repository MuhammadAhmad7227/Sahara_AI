import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { Tabs } from '@/components/common/Feedback';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchFeedback } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDateTime } from '@/utils/cn';

const statusTone = { received: 'warning', reviewing: 'info', resolved: 'success' } as const;

export default function AdminFeedbackPage() {
  useDocumentTitle('Admin — feedback');
  const { data, loading, error, reload } = useAsync(() => fetchFeedback(), []);
  const [tab, setTab] = useState('open');

  const filtered = (data ?? []).filter((item) => (tab === 'open' ? item.status !== 'resolved' : item.status === 'resolved'));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Feedback and corrections"
        description="Correction reports reopen the underlying service record. Handling them is how the knowledge base stays accurate."
      />

      <InlineNotice tone="info" title="Correction workflow">
        <p>
          Open the related service record, compare it with the official source, edit the record if needed, then
          republish it with a new date checked. The change is written to the audit log.
        </p>
      </InlineNotice>

      <Tabs
        label="Feedback status"
        items={[
          { id: 'open', label: 'Open', count: data?.filter((f) => f.status !== 'resolved').length },
          { id: 'resolved', label: 'Resolved', count: data?.filter((f) => f.status === 'resolved').length },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading && <TableSkeleton rows={3} />}
      {error && <ErrorState message={errorMessage(error)} onRetry={reload} />}

      {data && filtered.length === 0 && (
        <EmptyState icon={<MessageSquare className="size-5" />} title="Nothing here" description="There are no feedback items in this tab." />
      )}

      <div className="space-y-2">
        {filtered.map((item) => (
          <SectionCard key={item.id} className="!shadow-none">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-ink-900">{item.subject}</h2>
                <p className="text-xs text-ink-500">
                  {item.category.replace('_', ' ')} · {formatDateTime(item.createdAt)}
                  {item.email ? ` · ${item.email}` : ''}
                </p>
              </div>
              <Badge tone={statusTone[item.status]}>{item.status}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">{item.message}</p>
            {item.relatedServiceId && (
              <p className="mt-1.5 text-xs text-ink-500">
                Related record: <span className="font-mono">{item.relatedServiceId}</span>
              </p>
            )}
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
