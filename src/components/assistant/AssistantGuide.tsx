/**
 * AssistantGuide — the right-hand rail on the assistant page.
 *
 * Rendered twice: as a sticky column on desktop, and inside a Drawer on mobile.
 * Extracted into a component so the two never drift apart.
 *
 * It contains guidance, not answer content: how to read an answer, the answer
 * language control, provenance for the current answer, and the safety notice.
 */
import { Info, Languages, RotateCcw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { InlineNotice } from '@/components/common/States';
import { cn } from '@/utils/cn';
import type { AssistantAnswer, Language } from '@/types/domain';

const languages: Array<{ id: Language; native: string }> = [
  { id: 'en', native: 'English' },
  { id: 'ur', native: 'اردو' },
  { id: 'pa', native: 'پنجابی' },
];

export function AssistantGuide({
  lastAnswer,
  answerLanguage,
  setAnswerLanguage,
  onClear,
}: {
  lastAnswer?: AssistantAnswer;
  answerLanguage: Language;
  setAnswerLanguage: (lang: Language) => void;
  onClear?: () => void;
}) {
  return (
    <div className="space-y-3">
      <InlineNotice tone="info" title="How to read an answer">
        <p>
          Answers are assembled from demonstration records, which are not yet verified. The source information
          block shows any recorded publisher and date. Confirm important details with the official office.
        </p>
      </InlineNotice>

      <section className="rounded-xl border border-brand-900/[0.07] bg-paper p-4 shadow-1">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-950">
          <Languages className="size-3.5 text-brand-700" aria-hidden="true" />
          Answer language
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-ink-500">
          Choosing an answer language also changes the interface language. Some content may still appear in English.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 min-[380px]:grid-cols-3">
          {languages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setAnswerLanguage(lang.id)}
              aria-pressed={answerLanguage === lang.id}
              className={cn(
                'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                answerLanguage === lang.id
                  ? 'border-brand-500 bg-brand-50 text-brand-900'
                  : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50',
              )}
            >
              {lang.native}
            </button>
          ))}
        </div>
      </section>

      {lastAnswer && (
        <section className="rounded-xl border border-brand-900/[0.07] bg-paper p-4 shadow-1">
          <h2 className="text-sm font-semibold text-ink-950">This answer</h2>
          <dl className="mt-2 space-y-1.5 text-xs">
            {[
              ['Intent', lastAnswer.intent.replace(/_/g, ' ')],
              ['Records retrieved', String(lastAnswer.retrievedRecordCount)],
              ['Sources cited', String(lastAnswer.sources.length)],
              ['Engine', 'Demo retrieval'],
            ].map(([dt, dd]) => (
              <div key={dt} className="flex justify-between gap-2">
                <dt className="text-ink-500">{dt}</dt>
                <dd className="font-medium tabular text-ink-800">{dd}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 border-t border-ink-100 pt-2 text-[0.6875rem] leading-relaxed text-ink-500">
            The language-model call is produced by the backend once the Gemini integration is connected. This build
            assembles the answer directly from the stored record.
          </p>
        </section>
      )}

      <section className="rounded-xl border border-amber-900/15 bg-amber-50/70 p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-amber-950">
          <ShieldAlert className="size-4" aria-hidden="true" /> Never share secrets
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
          Do not type your password, OTP, PIN or full CNIC into this assistant. Sahara AI never asks for them, and
          anything you type here is processed as part of your question.
        </p>
      </section>

      <section className="rounded-xl border border-brand-900/[0.07] bg-paper p-4 text-xs leading-relaxed text-ink-600 shadow-1">
        <p className="flex items-start gap-1.5">
          <Info className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
          Conversations are kept in this browser tab only (session storage). Clearing the conversation removes
          them.
        </p>
        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={onClear}
            leadingIcon={<RotateCcw className="size-3.5" aria-hidden="true" />}
          >
            Start a new conversation
          </Button>
        )}
      </section>
    </div>
  );
}
