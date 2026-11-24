import { PhoneOff, Phone, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { EmptyState, ErrorState, InlineNotice, TableSkeleton } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchEmergencyAdmin } from '@/services/api/admin';
import { errorMessage } from '@/services/api/errors';
import { formatDate } from '@/utils/cn';
import type { EmergencyContact } from '@/types/domain';

function Row({ contact }: { contact: EmergencyContact }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900">
          {contact.number ? (
            <Phone className="size-3.5 text-emerald-600" aria-hidden="true" />
          ) : (
            <PhoneOff className="size-3.5 text-amber-600" aria-hidden="true" />
          )}
          {contact.name}
        </p>
        <p className="text-xs text-ink-500">
          {contact.category} · {contact.available}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs tabular text-ink-700">{contact.number ?? 'No number recorded'}</span>
        <Badge tone={contact.source.url ? 'success' : 'warning'}>
          {contact.source.lastVerifiedAt ? formatDate(contact.source.lastVerifiedAt) : 'Unverified'}
        </Badge>
        <VerificationBadge status={contact.verification} showIcon={false} />
      </div>
    </li>
  );
}

export default function AdminEmergencyPage() {
  useDocumentTitle('Admin — emergency contacts');
  const { data, loading, error, reload } = useAsync(() => fetchEmergencyAdmin(), []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Emergency contacts"
        description="Only publish a number after confirming it against the issuing authority’s own page. A wrong emergency number is worse than none."
      />

      <InlineNotice tone="warning" title="Verification standard for this table">
        <p>
          Required before publication: the number, the publisher, the official page URL, and the date checked. Rows
          without all four stay unverified and are displayed as “Number pending verification”.
        </p>
      </InlineNotice>

      {loading && <TableSkeleton rows={6} />}
      {error && <ErrorState message={errorMessage(error)} onRetry={reload} />}

      {data && (
        <>
          <SectionCard title="Emergency services" description={`${data.tollFree.length} entries`} flush>
            {data.tollFree.length === 0 ? (
              <div className="p-4">
                <EmptyState icon={<ShieldAlert className="size-5" />} title="No emergency contacts recorded" />
              </div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {data.tollFree.map((contact) => (
                  <Row key={contact.id} contact={contact} />
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Helplines" description={`${data.helplines.length} entries`} flush>
            <ul className="divide-y divide-ink-100">
              {data.helplines.map((contact) => (
                <Row key={contact.id} contact={contact} />
              ))}
            </ul>
          </SectionCard>
        </>
      )}
    </div>
  );
}
