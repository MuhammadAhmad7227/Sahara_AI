/**
 * AIMessage — renders an assistant answer as three visually distinct layers:
 *   1. the AI explanation (muted, labelled),
 *   2. the verified source information (elevated, with publisher + date checked),
 *   3. the trust/disclaimer note.
 * A reader must never be able to mistake layer 1 for an official statement.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  FileWarning,
  ThumbsDown,
  ThumbsUp,
  User,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { ListenButton } from '@/components/ai/ListenButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTextDirection } from '@/i18n';
import { copyText } from '@/utils/cn';
import { formatDate } from '@/utils/cn';
import type { AssistantAnswer, Language } from '@/types/domain';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  text: string;
  answer?: AssistantAnswer;
  onFeedback?: (helpful: boolean) => void;
  feedbackGiven?: boolean;
}

/** Minimal inline formatter: **bold**, newlines, and • bullets — no HTML injection. */
function FormattedText({ text, language }: { text: string; language: Language }) {
  const blocks = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {blocks.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" aria-hidden="true" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}><bdi dir={getTextDirection(language)} lang={language}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**') ? (
                <strong key={j} className="font-semibold text-ink-900">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </bdi></p>
        );
      })}
    </div>
  );
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end gap-2.5">
      <div className="max-w-[85%] rounded-2xl rounded-ee-md bg-brand-900 px-3.5 py-2.5 text-sm leading-relaxed text-white">
        <bdi dir="auto">{text}</bdi>
      </div>
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-ink-200 text-ink-600" aria-hidden="true">
        <User className="size-3.5" />
      </span>
    </div>
  );
}

export function AssistantMessage({ text, answer, onFeedback, feedbackGiven }: ChatMessageProps) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-900 text-white" aria-hidden="true">
        <BookOpen className="size-3.5" />
      </span>

      <div className="min-w-0 max-w-[92%] space-y-2.5">
        <div className="rounded-2xl rounded-es-md border border-ink-200 bg-white px-3.5 py-3 shadow-card">
          <p className="mb-2 flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-ink-400">
            <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            {t('assistant.aiExplanation')} · {t('assistant.demoRetrieval')}
          </p>

          <div className="text-ink-700">
            <FormattedText text={text} language={answer?.language ?? language} />
          </div>

          {answer?.noReliableRecord && (
            <p className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs leading-relaxed text-amber-900">
              <FileWarning className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              {t('assistant.noRecordInline')}
            </p>
          )}

          {/* Verified source block */}
          {answer && answer.sources.length > 0 && (
            <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/50 p-2.5">
              <p className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-brand-800">
                {t('verify.sourceInformation')}
              </p>
              <ul className="space-y-1.5">
                {answer.sources.map((source, i) => (
                  <li key={`${source.serviceId}-${i}`} className="text-xs text-ink-700">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone="brand">{source.publisher}</Badge>
                      <span className="font-medium text-ink-800">{source.sourceTitle}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.6875rem] text-ink-500">
                      <span>{t('verify.department')}: {source.department}</span>
                      <span>
                        {t('verify.lastChecked')}:{' '}
                        <span className="font-medium text-ink-700">
                          {source.lastVerifiedAt
                            ? formatDate(source.lastVerifiedAt)
                            : t('verify.notRecorded')}
                        </span>
                      </span>
                      {source.url ? (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 font-medium text-brand-800 hover:underline"
                        >
                          {t('verify.officialSource')}{' '}
                          <ExternalLink className="size-2.5" aria-hidden="true" />
                        </a>
                      ) : (
                        <span className="italic">{t('verify.urlNotRecorded')}</span>
                      )}
                      <Link to={`/services`} className="font-medium text-brand-800 hover:underline">
                        {t('action.openRecord')}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {answer?.disclaimer && (
            <p className="mt-2.5 border-t border-ink-100 pt-2 text-[0.6875rem] leading-relaxed text-ink-500">
              <bdi dir={getTextDirection(answer.language)} lang={answer.language}>{answer.disclaimer}</bdi>
            </p>
          )}
        </div>

        {/* Message actions. "Listen" comes first because it is the primary
            accessibility affordance for citizens who prefer audio. */}
        <div className="flex flex-wrap items-center gap-1">
          <ListenButton
            text={text}
            language={answer?.language ?? language}
          />
          <span className="mx-0.5 h-3 w-px bg-ink-200" aria-hidden="true" />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.6875rem] text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
          >
            {copied ? <Check className="size-3" aria-hidden="true" /> : <Copy className="size-3" aria-hidden="true" />}
            {copied ? t('action.copied') : t('action.copy')}
          </button>
          {onFeedback && (
            <>
              <span className="mx-0.5 h-3 w-px bg-ink-200" aria-hidden="true" />
              <button
                type="button"
                disabled={feedbackGiven}
                onClick={() => onFeedback(true)}
                aria-label={t('action.helpful')}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.6875rem] text-ink-500 transition-colors hover:bg-ink-100 hover:text-emerald-700 disabled:opacity-40"
              >
                <ThumbsUp className="size-3" aria-hidden="true" /> {t('action.helpful')}
              </button>
              <button
                type="button"
                disabled={feedbackGiven}
                onClick={() => onFeedback(false)}
                aria-label={t('action.notHelpful')}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[0.6875rem] text-ink-500 transition-colors hover:bg-ink-100 hover:text-red-700 disabled:opacity-40"
              >
                <ThumbsDown className="size-3" aria-hidden="true" /> {t('action.notHelpful')}
              </button>
              {feedbackGiven && (
                <span className="text-[0.6875rem] text-emerald-700" role="status">
                  {t('assistant.feedbackThanks')}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  const { t } = useLanguage();
  return (
    <div className="flex gap-2.5" role="status" aria-label={t('assistant.preparingAnswer')}>
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-brand-900 text-white" aria-hidden="true">
        <BookOpen className="size-3.5" />
      </span>
      <div className="rounded-2xl rounded-es-md border border-ink-200 bg-white px-3.5 py-3 shadow-card">
        <p className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-wider text-ink-400">
          {t('assistant.checkingRecords')}
        </p>
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="size-1.5 rounded-full bg-brand-500 animate-pulse-soft"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
          <span className="ms-1.5 text-xs text-ink-500">{t('assistant.searchingKnowledge')}</span>
        </div>
      </div>
    </div>
  );
}
