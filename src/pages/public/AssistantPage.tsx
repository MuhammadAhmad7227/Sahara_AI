import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUp,
  Info,
  Languages,
  Mic,
  MicOff,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useToast } from '@/components/common/Feedback';
import { AssistantMessage, TypingIndicator, UserMessage } from '@/components/assistant/ChatMessage';
import { SaharaOrb } from '@/components/brand/SaharaOrb';
import { Drawer } from '@/components/ui/Drawer';
import { AssistantGuide } from '@/components/assistant/AssistantGuide';
import { useLanguage } from '@/contexts/LanguageContext';
import { languageMeta } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { askAssistant, sendAssistantFeedback, supportedLanguages } from '@/services/api/assistant';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { AssistantAnswer, Language } from '@/types/domain';

interface Turn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  answer?: AssistantAnswer;
}

const suggestedQuestions = [
  'Mujhe domicile banwana hai, kya documents chahiye?',
  'How can I prepare an electricity complaint?',
  'What documents does Punjab require for a character certificate?',
  'Is this OTP message suspicious?',
  'How do I check a Fard for my land?',
];

const SESSION_KEY = 'sahara.assistant.thread';

export default function AssistantPage() {
  const { language, setLanguage, t, speechLocale, textDir } = useLanguage();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [answerLanguage, setAnswerLanguage] = useState<Language>(language);

  // Choosing a new interface language also selects it for answers and voice:
  // two languages on screen at once was the source of the mixed-language bug.
  useEffect(() => {
    setAnswerLanguage(language);
  }, [language]);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<Record<string, boolean>>({});
  /**
   * "Read answers aloud" — an opt-in for continuous use. It is a convenience on
   * top of the per-answer Listen button, and it goes through the same engine so
   * the voice always matches the answer language.
   */
  const [autoRead, setAutoRead] = useState(false);
  const tts = useSpeechSynthesis();

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastQuestionRef = useRef<string>('');

  useDocumentTitle(t('assistant.pageTitle'), t('assistant.pageDesc'));

  // Restore the conversation for this browser session only.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Turn[];
        if (Array.isArray(parsed)) setTurns(parsed.slice(-20));
      }
    } catch {
      /* ignore corrupted demo state */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(turns.slice(-20)));
    } catch {
      /* quota — non fatal */
    }
  }, [turns]);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || pending) return;

      lastQuestionRef.current = trimmed;
      setError(null);
      setInput('');
      setPending(true);
      setTurns((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);

      try {
        const answer = await askAssistant({ question: trimmed, language: answerLanguage });
        setTurns((prev) => [
          ...prev,
          { id: answer.id, role: 'assistant', text: answer.answer, answer },
        ]);
        setParams({}, { replace: true });

        if (autoRead && tts.hasVoiceFor(answer.language)) tts.speak(answer.answer, answer.language);

      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setPending(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [answerLanguage, pending, setParams, autoRead, tts],
  );

  // Handle ?q= deep links from service cards (asked once).
  const initialQuestion = params.get('q');
  useEffect(() => {
    if (initialQuestion) void ask(initialQuestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, pending]);

  /*
   * Recognition locale follows the SELECTED language via the shared registry,
   * so a Punjabi speaker is never silently given the Urdu model. When the
   * browser reports it has no model for the locale, `languageUnsupported` turns
   * true and the composer shows a plain, honest fallback instead of a mic that
   * does nothing.
   */
  const speech = useSpeechRecognition({
    language: speechLocale,
    onResult: (transcript) => setInput((current) => `${current} ${transcript}`.trim()),
  });

  const handleFeedback = async (messageId: string, helpful: boolean) => {
    setFeedbackFor((prev) => ({ ...prev, [messageId]: true }));
    try {
      await sendAssistantFeedback({ messageId, helpful });
    } catch {
      toast('Feedback could not be recorded. Nothing was lost on your device.', 'warning');
    }
  };

  const clearConversation = () => {
    setTurns([]);
    setError(null);
    sessionStorage.removeItem(SESSION_KEY);
    setParams({}, { replace: true });
  };

  const [sourcesOpen, setSourcesOpen] = useState(false);

  const lastAnswer = useMemo(() => [...turns].reverse().find((turn) => turn.answer)?.answer, [turns]);

  return (
    <div className="container-page py-5 sm:py-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-6">
        {/* Chat column */}
        <div className="flex min-h-[calc(100dvh-12rem)] flex-col overflow-hidden rounded-2xl border border-brand-900/[0.07] bg-paper shadow-2 shadow-bevel">
          {/* Chat header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-900/[0.07] bg-gradient-to-b from-sand-50/80 to-transparent px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2.5">
              <SaharaOrb size={38} state={pending ? 'thinking' : 'idle'} />
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-ink-950">Sahara AI assistant</h1>
                <p className="mt-0.5 flex items-center gap-1 text-[0.6875rem] text-ink-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-soft" aria-hidden="true" />
                  {pending ? t('assistant.checkingRecords') : t('assistant.reviewedRecordsOnly')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <label htmlFor="answer-language" className="sr-only">
                {t('lang.assistantLanguage')}
              </label>
              <div className="relative">
                <Languages className="pointer-events-none absolute inset-y-0 start-2 my-auto size-3.5 text-ink-400" aria-hidden="true" />
                <select
                  id="answer-language"
                  value={answerLanguage}
                  onChange={(e) => {
                    const next = e.target.value as Language;
                    setAnswerLanguage(next);
                    setLanguage(next);
                  }}
                  className="h-8 rounded-md border border-brand-900/15 bg-white ps-7 pe-6 text-xs font-medium text-ink-700"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.native}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setSourcesOpen(true)}
                leadingIcon={<Info className="size-3.5" aria-hidden="true" />}
              >
                <span className="hidden min-[420px]:inline">{t('assistant.sources')}</span>
              </Button>
              {turns.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  leadingIcon={<Trash2 className="size-3.5" aria-hidden="true" />}
                  aria-label={t('assistant.clearConversation')}
                >
                  <span className="hidden sm:inline">{t('assistant.clear')}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div
            className="flex-1 space-y-4 overflow-y-auto scrollbar-slim bg-cream/40 px-3 py-4 sm:px-5"
            role="log"
            aria-live="polite"
            aria-label={t('assistant.conversationLabel')}
          >
            {turns.length === 0 && (
              <div className="mx-auto max-w-lg py-6 text-center">
                <SaharaOrb size={64} state="idle" className="mx-auto" />
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink-950">{t('assistant.greeting')}</h2>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-600">
                  {t('assistant.intro')}
                </p>

                <div className="mt-4 space-y-1.5 text-start">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
                    {t('assistant.tryThese')}
                  </p>
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void ask(question)}
                      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-brand-900/[0.08] bg-white px-3 py-2.5 text-start text-sm text-ink-700 shadow-1 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-brand-900/15 hover:shadow-2"
                    >
                      <span className="min-w-0">{question}</span>
                      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-800 transition-colors group-hover:bg-brand-900 group-hover:text-white">
                        <ArrowUp className="size-3 rotate-45 dir-arrow" aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((turn) =>
              turn.role === 'user' ? (
                <UserMessage key={turn.id} text={turn.text} />
              ) : (
                <AssistantMessage
                  key={turn.id}
                  role="assistant"
                  text={turn.text}
                  answer={turn.answer}
                  onFeedback={(helpful) => void handleFeedback(turn.id, helpful)}
                  feedbackGiven={Boolean(feedbackFor[turn.id])}
                />
              ),
            )}

            {pending && <TypingIndicator />}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">
                <p className="font-medium">{t('assistant.failed')}</p>
                <p className="mt-0.5 text-xs leading-relaxed">{error}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => lastQuestionRef.current && void ask(lastQuestionRef.current)}
                  >
                    {t('action.tryAgain')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setError(null)}>
                    {t('action.dismiss')}
                  </Button>
                </div>
                <p className="mt-2 text-[0.6875rem] text-red-800/80">
                  Browsing services, checklists and helplines keep working without the assistant.
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-brand-900/[0.07] bg-paper p-2.5 sm:p-3">
            <p dir="auto" className="mb-2 px-2 text-xs leading-relaxed text-ink-600">{t('voice.turnBasedNote')}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void ask(input);
              }}
              className="rounded-xl border border-brand-900/10 bg-white p-1.5 shadow-1 transition-[border-color,box-shadow] focus-within:border-brand-500 focus-within:shadow-2 focus-within:ring-2 focus-within:ring-brand-500/15"
            >
              <label htmlFor="assistant-input" className="sr-only">
                {t('assistant.send')}
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                value={input}
                dir={input.trim() ? 'auto' : textDir}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void ask(input);
                  }
                }}
                rows={2}
                maxLength={800}
                placeholder={t('assistant.placeholder')}
                className="max-h-40 min-h-11 w-full resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1">
                  {speech.supported && !speech.languageUnsupported ? (
                    <button
                      type="button"
                      onClick={speech.listening ? speech.stop : speech.start}
                      aria-pressed={speech.listening}
                      aria-label={speech.listening ? t('voice.stop') : t('voice.speak')}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                        speech.listening
                          ? 'bg-red-100 text-red-800'
                          : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                      )}
                      title={speech.listening ? t('voice.stop') : t('voice.speak')}
                    >
                      {speech.listening ? (
                        <>
                          <MicOff className="size-3.5" aria-hidden="true" /> {t('voice.stopShort')}
                        </>
                      ) : (
                        <>
                          <Mic className="size-3.5" aria-hidden="true" /> {t('voice.speakShort')}
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-500"
                      title={
                        speech.languageUnsupported
                          ? t('voice.languageUnsupported', { language: languageMeta[answerLanguage].native })
                          : t('voice.browserUnsupported')
                      }
                    >
                      <MicOff className="size-3.5" aria-hidden="true" />
                      {speech.languageUnsupported ? t('voice.speakUnavailable') : t('voice.unavailable')}
                    </span>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-600 hover:bg-ink-100">
                    <input
                      type="checkbox"
                      checked={autoRead}
                      disabled={!tts.hasVoiceFor(answerLanguage)}
                      onChange={(e) => setAutoRead(e.target.checked)}
                      className="size-3.5 accent-brand-800"
                    />
                    {t('voice.readAloud')}
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="hidden text-[0.625rem] text-ink-400 sm:inline">{input.length}/800</span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={pending || !input.trim()}
                    aria-label={t('assistant.send')}
                    className="size-8 !px-0"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </form>
            {!tts.hasVoiceFor(answerLanguage) && (
              <p className="mt-1.5 px-2 text-xs leading-relaxed text-ink-500" role="status">
                {t('reader.unavailable', { language: languageMeta[answerLanguage].native })}
              </p>
            )}
            {speech.listening && (
              <p className="mt-1.5 px-2 text-xs text-ink-600" role="status">
                {t('voice.listeningNote')}
              </p>
            )}
            {/* A locale without a model is a permanent condition, so it gets a
                standing message rather than an error the user cannot fix. */}
            {speech.languageUnsupported && (
              <p className="mt-1.5 px-2 text-xs leading-relaxed text-ink-500" role="status">
                {t('voice.languageUnsupported', { language: languageMeta[answerLanguage].native })}
              </p>
            )}
            {speech.error && !speech.languageUnsupported && (
              <p className="mt-1.5 px-2 text-xs text-amber-800" role="status">
                {speech.error}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Guidance rail on desktop (sticky), Drawer on mobile. */}
      <aside className="hidden lg:block" aria-label={t('assistant.sourcesPanel')}>
        <div className="sticky top-20">
          <AssistantGuide lastAnswer={lastAnswer} answerLanguage={answerLanguage} setAnswerLanguage={setAnswerLanguage} onClear={turns.length > 0 ? clearConversation : undefined} />
        </div>
      </aside>

      <Drawer
        open={sourcesOpen}
        onClose={() => setSourcesOpen(false)}
        title={t('assistant.sourcesPanel')}
        description="How to read an answer, and what this assistant will not do"
        size="md"
      >
        <AssistantGuide
          lastAnswer={lastAnswer}
          answerLanguage={answerLanguage}
          setAnswerLanguage={setAnswerLanguage}
          onClear={turns.length > 0 ? clearConversation : undefined}
        />
      </Drawer>
    </div>
  );
}
