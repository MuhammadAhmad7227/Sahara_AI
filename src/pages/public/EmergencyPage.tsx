import { Phone, PhoneOff, ShieldAlert } from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { CardGridSkeleton, ErrorState, InlineNotice } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { listEmergencyContacts } from '@/services/api/directory';
import { errorMessage } from '@/services/api/errors';
import { formatDate } from '@/utils/cn';
import type { EmergencyContact } from '@/types/domain';

const categoryMeta: Record<EmergencyContact['category'], { label: string; tone: string }> = {
  police: { label: 'Police', tone: 'bg-sky-100 text-sky-900' },
  rescue: { label: 'Rescue', tone: 'bg-orange-100 text-orange-900' },
  ambulance: { label: 'Medical', tone: 'bg-red-100 text-red-900' },
  fire: { label: 'Fire', tone: 'bg-rose-100 text-rose-900' },
  cybercrime: { label: 'Cybercrime', tone: 'bg-violet-100 text-violet-900' },
  other: { label: 'Other', tone: 'bg-ink-100 text-ink-800' },
};

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const meta = categoryMeta[contact.category];
  const hasNumber = Boolean(contact.number);

  return (
    <article className="flex h-full flex-col rounded-xl border border-ink-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide ${meta.tone}`}>
          {meta.label}
        </span>
        <VerificationBadge status={contact.verification} />
      </div>

      <h3 className="mt-2 text-base font-semibold text-ink-900">{contact.name}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-600">{contact.description}</p>

      <div className="mt-3 rounded-lg border border-dashed border-ink-300 bg-ink-50/60 px-3 py-2">
        {hasNumber ? (
          <a
            href={`tel:${contact.number?.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-lg font-semibold text-brand-900 tabular hover:underline"
          >
            <Phone className="size-4" aria-hidden="true" />
            {contact.number}
          </a>
        ) : (
          <p className="flex items-center gap-2 text-sm font-medium text-ink-500">
            <PhoneOff className="size-4" aria-hidden="true" />
            Number pending verification
          </p>
        )}
        <p className="mt-0.5 text-[0.6875rem] text-ink-500">{contact.available}</p>
      </div>

      <dl className="mt-auto space-y-1 border-t border-ink-100 pt-2.5 text-[0.6875rem] text-ink-500">
        <div className="flex justify-between gap-2">
          <dt>Publisher</dt>
          <dd className="truncate font-medium text-ink-700">{contact.source.publisher}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Last checked</dt>
          <dd className="font-medium text-ink-700">
            {contact.source.lastVerifiedAt ? formatDate(contact.source.lastVerifiedAt) : 'Not recorded'}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default function EmergencyPage() {
  useDocumentTitle(
    'Emergency centre',
    'Emergency and public helpline contacts. In a real emergency, call the official emergency service directly — Sahara AI does not dispatch services.',
  );

  const { data, loading, error, reload } = useAsync(() => listEmergencyContacts(), []);

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-5 rounded-xl border-2 border-red-300 bg-red-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-600 text-white" aria-hidden="true">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-red-950">Emergency centre</h1>
            <p className="mt-1 text-sm leading-relaxed text-red-900">
              If someone is in immediate danger, contact the emergency service directly. Sahara AI does not dispatch
              police, rescue or ambulance services and cannot register a case for you.
            </p>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow="Verified public contacts"
        title="Emergency and helpline numbers"
        description="Numbers are shown only when a reviewer has recorded them against an official publisher. Unverified entries say so rather than displaying a guessed number."
      />

      <div className="mt-4">
        <InlineNotice tone="warning" title="Why numbers are missing in this build">
          <p>
            This is a development build, so no telephone number has been recorded yet. Each card shows its publisher
            and ‘Not recorded’ for the date checked. When the backend is connected, verified rows replace these
            placeholders and one-tap calling is enabled.
          </p>
        </InlineNotice>
      </div>

      <section className="mt-6" aria-labelledby="emergency-services">
        <h2 id="emergency-services" className="mb-3 text-base font-semibold text-ink-900">
          Emergency services
        </h2>
        {loading && <CardGridSkeleton count={6} />}
        {!loading && error && (
          <ErrorState title="Unable to load contacts" message={errorMessage(error)} onRetry={reload} />
        )}
        {!loading && !error && data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.tollFree.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8" aria-labelledby="helplines">
        <h2 id="helplines" className="mb-3 text-base font-semibold text-ink-900">
          Public helplines
        </h2>
        {!loading && !error && data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.helplines.map((contact) => (
              <ContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <SectionCard title="What to say when you call" description="Short, clear information helps the operator act faster.">
          <ul className="space-y-1.5 text-sm text-ink-700">
            <li>· Where exactly you are, with a landmark if helpful.</li>
            <li>· What has happened and how many people are affected.</li>
            <li>· Whether anyone is injured or in danger.</li>
            <li>· Your name and a number you can be reached on.</li>
          </ul>
        </SectionCard>

        <SectionCard title="If it is a scam, not an emergency">
          <p className="text-sm leading-relaxed text-ink-600">
            Use the scam detector to understand the indicators, contact your bank using the number on your card if
            money is involved, and report through the official cybercrime channel.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <LinkButton to="/scam-detector" variant="outline" size="sm">
              Check a message
            </LinkButton>
            <Badge tone="info">Never share an OTP or PIN</Badge>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
