import { useState } from 'react';
import { HeartHandshake, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge, ReviewStatusBadge, VerificationBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchWelfareAdmin } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDate } from '@/utils/cn';

export default function AdminWelfarePage() {
  useDocumentTitle('Admin — welfare schemes');
  const { data, loading, error, reload } = useAsync(() => fetchWelfareAdmin(), []);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Welfare schemes"
        description="The matching rules stored here determine what the Welfare Assistant shows. Only administrative criteria are stored — no personal data."
        actions={<Button variant="outline" size="sm" leadingIcon={<Plus className="size-4" aria-hidden="true" />} disabled title="Requires the backend API">New scheme</Button>}
      />

      <InlineNotice tone="warning" title="Never store eligibility outcomes">
        <p>
          Store the programme’s published criteria only. The assistant must always present a match as “may match the
          stored criteria” and direct the person to the programme authority.
        </p>
      </InlineNotice>

      {loading && <TableSkeleton rows={4} />}
      {error && <ErrorState message={errorMessage(error)} onRetry={reload} />}

      {data && data.length === 0 && <EmptyState icon={<HeartHandshake className="size-5" />} title="No schemes recorded" />}

      {data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((scheme) => (
            <SectionCard key={scheme.id} className="!shadow-none">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-ink-900">{scheme.name}</h2>
                  <p className="text-xs text-ink-500">{scheme.provider}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <VerificationBadge status={scheme.verification} />
                  <ReviewStatusBadge status={scheme.status} />
                </div>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-ink-600">{scheme.description}</p>

              <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-ink-500">Districts</dt>
                  <dd className="font-medium text-ink-800">
                    {scheme.districts === 'all' ? 'All districts' : `${scheme.districts.length} district(s)`}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-500">Income bands</dt>
                  <dd className="font-medium text-ink-800">{scheme.incomeBands.length} band(s)</dd>
                </div>
                <div>
                  <dt className="text-ink-500">Last verified</dt>
                  <dd className="font-medium text-ink-800">
                    {scheme.officialSource.lastVerifiedAt ? formatDate(scheme.officialSource.lastVerifiedAt) : 'Not recorded'}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)}
                aria-expanded={expanded === scheme.id}
                className="mt-2 text-xs font-medium text-brand-800 hover:underline"
              >
                {expanded === scheme.id ? 'Hide' : 'Show'} eligibility rules
              </button>

              {expanded === scheme.id && (
                <div className="mt-2 rounded-lg border border-ink-200 bg-ink-50 p-3 text-xs">
                  <p className="font-medium text-ink-800">Eligibility summary</p>
                  <p className="mt-0.5 leading-relaxed text-ink-600">{scheme.eligibilitySummary}</p>
                  <p className="mt-2 font-medium text-ink-800">Documents</p>
                  <ul className="mt-0.5 list-disc ps-4 text-ink-600">
                    {scheme.requiredDocuments.map((doc) => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone={scheme.officialSource.url ? 'success' : 'warning'}>
                      {scheme.officialSource.url ? 'Official URL recorded' : 'No official URL recorded'}
                    </Badge>
                  </div>
                </div>
              )}
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
