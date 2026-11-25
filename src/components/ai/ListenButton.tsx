/**
 * ListenButton — "Listen / Pause / Resume / Listen again".
 *
 * Follows the answer language. If the device has no matching voice, the button
 * is disabled with an explanatory tooltip rather than reading Urdu text with an
 * English voice.
 */
import { Headphones, Pause, Play, RotateCcw, TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languageMeta } from '@/i18n';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { cn } from '@/utils/cn';
import type { Language } from '@/types/domain';

export function ListenButton({
  text,
  language,
  size = 'sm',
  className,
}: {
  text: string;
  /** Language of the answer, which may differ from the interface language. */
  language: Language;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { t } = useLanguage();
  const { supported, state, toggle, speak, hasVoiceFor } = useSpeechSynthesis();

  const native = languageMeta[language].native;
  const voiceReady = supported && hasVoiceFor(language);

  // Not supported at all, or no voice installed for this language.
  if (!voiceReady) {
    return (
      <span
        className={cn('inline-flex items-center gap-1 text-xs text-ink-400', className)}
        title={t('lang.unsupportedVoiceOutput', { language: native })}
      >
        <TriangleAlert className="size-3.5" aria-hidden="true" />
        {supported ? t('voice.notAvailable', { language: native }) : t('lang.unsupported')}
      </span>
    );
  }

  const speaking = state === 'speaking';
  const paused = state === 'paused';
  const errored = state === 'error';

  const label = errored
    ? t('action.retry')
    : speaking
      ? t('action.pause')
      : paused
        ? t('action.resume')
        : t('action.listen');

  const Icon = errored ? RotateCcw : speaking ? Pause : paused ? Play : Headphones;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={() => (errored ? speak(text, language) : toggle(text, language))}
        aria-label={
          speaking
            ? t('action.pause')
            : paused
              ? t('action.resume')
              : `${t('assistant.listen')} — ${native}`
        }
        aria-pressed={speaking}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border font-medium transition-colors',
          size === 'sm' ? 'h-7 px-2 text-[0.6875rem]' : 'h-8 px-2.5 text-xs',
          speaking
            ? 'border-accent-300 bg-accent-500/15 text-accent-700 hover:bg-accent-500/25'
            : paused
              ? 'border-brand-200 bg-brand-50 text-brand-800'
              : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900',
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
        {speaking && (
          <span className="ms-0.5 inline-flex items-end gap-px" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-0.5 animate-pulse-soft rounded-full bg-current"
                style={{ height: `${5 + i * 2}px`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </button>

      {state === 'speaking' && (
        <span className="sr-only" role="status">
          {t('assistant.listening')}
        </span>
      )}
      {state === 'error' && (
        <span className="text-[0.6875rem] text-amber-700" role="status">
          {t('voice.error')}
        </span>
      )}
      {state === 'paused' && (
        <span className="text-[0.6875rem] text-ink-500" role="status">
          {t('voice.paused')}
        </span>
      )}
    </div>
  );
}
