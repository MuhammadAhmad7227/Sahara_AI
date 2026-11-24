/**
 * SourceCard — the visible provenance block required by the project's central
 * rule: the model explains, the knowledge base asserts, and the user can see the
 * publisher, the source title and the date it was checked.
 *
 * A missing URL or reviewer is shown plainly as "not recorded". The component
 * never fabricates an official link.
 */
import { ExternalLink, FileText, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { ReviewStatusBadge, Badge } from '@/components/common/Badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/utils/cn';
import type { SourceRecord } from '@/types/domain';

export function SourceCard({ source, compact }: { source: SourceRecord; compact?: boolean }) {
  const { t } = useLanguage();
  const hasUrl = Boolean(source.url);
  const verified = source.status === 'approved' || source.status === 'published';

  return (
    <div className="rounded-lg border border-ink-200 bg-ink-50/50 p-3">
      <div className="flex items-start gap-2.5">
        <span
          className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-white text-brand-800 ring-1 ring-ink-200"
          aria-hidden="true"
        >
          {verified ? <ShieldCheck className="size-4" /> : <ShieldQuestion className="size-4" />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-900">{source.title}</p>
          <p className="mt-0.5 text-xs text-ink-600">
            <span className="font-medium">{t('verify.publisher')}:</span> {source.publisher}
          </p>

          <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs text-ink-600 sm:grid-cols-2">
            <div>
              <dt className="inline text-ink-500">{t('verify.lastChecked')}: </dt>
              <dd className="inline font-medium text-ink-800">
                {source.checkedAt ? formatDate(source.checkedAt) : t('verify.notRecorded')}
              </dd>
            </div>
            <div>
              <dt className="inline text-ink-500">{t('verify.reviewer')}: </dt>
              <dd className="inline">{source.reviewer ?? t('verify.notRecorded')}</dd>
            </div>
          </dl>

          {!compact && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ReviewStatusBadge status={source.status} />
              {hasUrl ? (
                <a
                  href={source.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-800 hover:underline"
                >
                  Open source <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              ) : (
                <Badge tone="warning" icon={<FileText className="size-3" aria-hidden="true" />}>
                  URL not recorded yet
                </Badge>
              )}
            </div>
          )}

          {source.notes && <p className="mt-2 text-xs italic text-ink-500">{source.notes}</p>}
        </div>
      </div>
    </div>
  );
}

export function SourceList({ sources, compact }: { sources: SourceRecord[]; compact?: boolean }) {
  if (!sources.length) {
    return (
      <div className="rounded-lg border border-dashed border-ink-300 bg-ink-50/40 p-3 text-sm text-ink-600">
        No official source has been recorded for this service yet. Treat the information below as
        unverified and confirm it with the department.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {sources.map((s) => (
        <SourceCard key={s.id} source={s} compact={compact} />
      ))}
    </div>
  );
}
