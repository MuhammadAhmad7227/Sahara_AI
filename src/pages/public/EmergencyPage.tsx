import { Phone, PhoneOff, ShieldAlert } from 'lucide-react';
import { LinkButton } from '@/components/common/Button';
import { Badge, VerificationBadge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { CardGridSkeleton, ErrorState, InlineNotice } from '@/components/common/States';
import { useAsync } from '@/hooks/useAsync';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { listEmergencyContacts } from '@/services/api/directory';
import { errorMessage } from '@/services/api/errors';
import { formatDate } from '@/utils/cn';
import type { EmergencyContact } from '@/types/domain';

const categoryMeta: Record<
  EmergencyContact['category'],
  { labelKey: TranslationKey; tone: string }
> = {
  police: { labelKey: 'emergency.police', tone: 'bg-sky-100 text-sky-900' },
  rescue: { labelKey: 'emergency.rescue', tone: 'bg-orange-100 text-orange-900' },
  ambulance: { labelKey: 'emergency.medical', tone: 'bg-red-100 text-red-900' },
  fire: { labelKey: 'emergency.fire', tone: 'bg-rose-100 text-rose-900' },
  cybercrime: { labelKey: 'emergency.cybercrime', tone: 'bg-ink-100 text-ink-800' },
  other: { labelKey: 'emergency.other', tone: 'bg-ink-100 text-ink-800' },
};

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const { t } = useLanguage();
  const meta = categoryMeta[contact.category];
  const hasNumber = Boolean(contact.number);

  return (
    <article className="flex h-full flex-col rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <span className={`rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide ${meta.tone}`}>
          {t(meta.labelKey)}
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
            {t('emergency.numberPending')}
          </p>
        )}
        <p className="mt-0.5 text-[0.6875rem] text-ink-500">{contact.available}</p>
      </div>

      <dl className="mt-auto space-y-1 border-t border-ink-100 pt-2.5 text-[0.6875rem] text-ink-500">
        <div className="flex justify-between gap-2">
          <dt>{t('verify.publisher')}</dt>
          <dd className="truncate font-medium text-ink-700">{contact.source.publisher}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>{t('verify.lastChecked')}</dt>
          <dd className="font-medium text-ink-700">
            {contact.source.lastVerifiedAt
              ? formatDate(contact.source.lastVerifiedAt)
              : t('verify.notRecorded')}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default function EmergencyPage() {
  const { t } = useLanguage();
  useDocumentTitle(t('emergency.pageTitle'), t('emergency.pageDesc'));

  const { data, loading, error, reload } = useAsync(() => listEmergencyContacts(), []);

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-5 rounded-xl border-2 border-red-300 bg-red-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-600 text-white" aria-hidden="true">
            <ShieldAlert className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-red-950">
              {t('emergency.heading')}
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-red-900">{t('emergency.banner')}</p>
          </div>
        </div>
      </div>

      <PageHeader
        eyebrow={t('emergency.eyebrow')}
        title={t('emergency.title')}
        description={t('emergency.description')}
      />

      <div className="mt-4">
        <InlineNotice tone="warning" title={t('emergency.missingTitle')}>
          <p>{t('emergency.missingBody')}</p>
        </InlineNotice>
      </div>

      <section className="mt-6" aria-labelledby="emergency-services">
        <h2 id="emergency-services" className="mb-3 text-base font-semibold text-ink-900">
          {t('emergency.services')}
        </h2>
        {loading && <CardGridSkeleton count={6} />}
        {!loading && error && (
          <ErrorState
            title={t('emergency.loadError')}
            message={errorMessage(error)}
            onRetry={reload}
          />
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
          {t('emergency.helplines')}
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
        <SectionCard title={t('emergency.whatToSayTitle')} description={t('emergency.whatToSayDesc')}>
          <ul className="space-y-1.5 text-sm text-ink-700">
            <li>· {t('emergency.say1')}</li>
            <li>· {t('emergency.say2')}</li>
            <li>· {t('emergency.say3')}</li>
            <li>· {t('emergency.say4')}</li>
          </ul>
        </SectionCard>

        <SectionCard title={t('emergency.scamTitle')}>
          <p className="text-sm leading-relaxed text-ink-600">{t('emergency.scamBody')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <LinkButton to="/scam-detector" variant="outline" size="sm">
              {t('emergency.checkMessage')}
            </LinkButton>
            <Badge tone="info">{t('emergency.neverShare')}</Badge>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
