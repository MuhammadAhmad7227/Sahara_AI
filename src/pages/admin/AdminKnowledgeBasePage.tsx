import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, CircleDashed, FileCheck2, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { ReviewStatusBadge, VerificationBadge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchKnowledgeRecords } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { useToast } from '@/components/common/Feedback';
import { cn, formatDate } from '@/utils/cn';
import type { ReviewStatus } from '@/types/domain';

const stages: { id: ReviewStatus; label: string; description: string; icon: typeof CircleDashed }[] = [
  { id: 'draft', label: 'Draft', description: 'Content entered, no source confirmed', icon: CircleDashed },
  { id: 'pending_review', label: 'Pending review', description: 'A reviewer compares it with the official source', icon: FileCheck2 },
  { id: 'approved', label: 'Approved', description: 'Source, date checked and reviewer recorded', icon: ShieldCheck },
  { id: 'published', label: 'Published', description: 'Visible to citizens with its provenance', icon: CheckCircle2 },
];

/**
 * The central RAG workflow board (spec §29).
 * Staff can see exactly which information the assistant is allowed to use.
 */
export default function AdminKnowledgeBasePage() {
  useDocumentTitle('Admin — knowledge base');
  const { toast } = useToast();
  const { data, loading, error, reload } = useAsync(() => fetchKnowledgeRecords(), []);
  const [selected, setSelected] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, typeof data> = { draft: [], pending_review: [], approved: [], published: [] };
    for (const record of data ?? []) {
      if (map[record.status]) map[record.status]!.push(record);
    }
    return map;
  }, [data]);

  const selectedRecord = data?.find((r) => r.id === selected);

  const advance = (recordId: string, current: ReviewStatus) => {
    const order: ReviewStatus[] = ['draft', 'pending_review', 'approved', 'published'];
    const index = order.indexOf(current);
    const next = order[index + 1];
    if (!next) return;
    toast(`Demonstration: record moved to “${next.replace('_', ' ')}”. The backend will persist this and write an audit entry.`, 'info');
    setSelected(recordId);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Knowledge-base review workflow"
        description="Only published records with an approved source may be used by the assistant. This board makes that state visible before a citizen ever sees an answer."
      />

      <InlineNotice tone="info" title="Why this page exists">
        <p>
          The assistant is only as trustworthy as what it is allowed to read. A record moves left to right only when a
          reviewer has checked it against an official source and recorded the date checked.
        </p>
      </InlineNotice>

      {/* Pipeline summary */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => {
          const count = grouped[stage.id]?.length ?? 0;
          return (
            <div key={stage.id} className="relative rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-3.5">
              <div className="flex items-center justify-between">
                <ReviewStatusBadge status={stage.id} />
                <span className="text-lg font-semibold tabular text-ink-900">{loading ? '—' : count}</span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-ink-800">
                <stage.icon className="size-4 text-brand-700" aria-hidden="true" />
                {stage.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-500">{stage.description}</p>
              {index < stages.length - 1 && (
                <ArrowRight className="absolute -end-2 top-1/2 hidden size-4 -translate-y-1/2 text-ink-300 lg:block dir-arrow" aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      {loading && <TableSkeleton rows={4} />}
      {error && <ErrorState message={errorMessage(error)} onRetry={reload} />}

      {data && (
        <div className="grid gap-3 lg:grid-cols-4">
          {stages.map((stage) => (
            <section key={stage.id} className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 shadow-bevel" aria-label={`${stage.label} records`}>
              <h2 className="border-b border-ink-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {stage.label}
              </h2>
              <ul className="max-h-96 space-y-1.5 overflow-y-auto scrollbar-slim p-2">
                {(grouped[stage.id] ?? []).length === 0 && (
                  <li className="px-2 py-4 text-center text-xs text-ink-400">Empty</li>
                )}
                {(grouped[stage.id] ?? []).map((record) => (
                  <li key={record.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(record.id)}
                      className={cn(
                        'w-full rounded-lg border p-2 text-start transition-colors',
                        selected === record.id ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:border-brand-300',
                      )}
                    >
                      <p className="text-sm font-medium leading-snug text-ink-900">{record.service.name}</p>
                      <p className="mt-0.5 truncate text-[0.6875rem] text-ink-500">{record.service.department}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <VerificationBadge status={record.service.verification} showIcon={false} />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {selectedRecord && (
        <SectionCard
          title={selectedRecord.service.name}
          description="What the assistant may say about this record right now."
          action={<ReviewStatusBadge status={selectedRecord.status} />}
        >
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-500">Department</dt>
              <dd className="font-medium text-ink-900">{selectedRecord.service.department}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Jurisdiction</dt>
              <dd className="font-medium text-ink-900">{selectedRecord.service.jurisdiction}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Source title</dt>
              <dd className="font-medium text-ink-900">{selectedRecord.source?.title ?? 'No source recorded'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Publisher</dt>
              <dd className="font-medium text-ink-900">{selectedRecord.source?.publisher ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Date checked</dt>
              <dd className="font-medium text-ink-900">
                {selectedRecord.source?.checkedAt ? formatDate(selectedRecord.source.checkedAt) : 'Not recorded'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Reviewer</dt>
              <dd className="font-medium text-ink-900">{selectedRecord.source?.reviewer ?? 'Not recorded'}</dd>
            </div>
          </dl>

          <div className="mt-3 rounded-lg border border-ink-200 bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
            {selectedRecord.status === 'published'
              ? 'The assistant may use this record and will show its source and date checked.'
              : 'The assistant will not present this record as verified information. Citizen-facing pages label it as unverified.'}
          </div>

          {selectedRecord.status !== 'published' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => advance(selectedRecord.id, selectedRecord.status)}
                className="inline-flex h-9 items-center rounded-lg bg-brand-900 px-3 text-sm font-medium text-white hover:bg-brand-800"
              >
                Advance to next stage
              </button>
              <p className="self-center text-xs text-ink-500">
                Requires: source approved, date checked recorded, reviewer recorded.
              </p>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
