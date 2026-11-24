import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUp,
  Info,
  Languages,
  Mic,
  MicOff,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { InlineNotice } from '@/components/common/States';
import { useToast } from '@/components/common/Feedback';
import { AssistantMessage, TypingIndicator, UserMessage } from '@/components/assistant/ChatMessage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { askAssistant, sendAssistantFeedback, supportedLanguages } from '@/services/api/assistant';
import { errorMessage } from '@/services/api/errors';
import { cn } from '@/utils/cn';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
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
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [answerLanguage, setAnswerLanguage] = useState<Language>(language);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<Record<string, boolean>>({});
  const [speakAnswers, setSpeakAnswers] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastQuestionRef = useRef<string>('');

  useDocumentTitle(
    'Ask Sahara AI',
    'Ask a civic question in Urdu, Punjabi or English and get an answer grounded in reviewed public records, with the source and the date it was checked.',
  );

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

        if (speakAnswers && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(answer.answer.slice(0, 500));
          utterance.lang = answerLanguage === 'en' ? 'en-PK' : 'ur-PK';
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setPending(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [answerLanguage, pending, setParams, speakAnswers],
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

  const speech = useSpeechRecognition({
    language: answerLanguage === 'en' ? 'en-PK' : 'ur-PK',
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

  const lastAnswer = useMemo(() => [...turns].reverse().find((turn) => turn.answer)?.answer, [turns]);

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:gap-6">
        {/* Chat column */}
        <div className="flex min-h-[calc(100dvh-11rem)] flex-col overflow-hidden rounded-xl border border-ink-200 bg-white shadow-card">
          {/* Chat header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-brand-900 text-white" aria-hidden="true">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h1 className="text-sm font-semibold text-ink-900">Sahara AI assistant</h1>
                <p className="flex items-center gap-1 text-[0.6875rem] text-ink-500">
                  <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Demo retrieval · answers only from reviewed records
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
                  className="h-8 rounded-md border border-ink-300 bg-white ps-7 pe-6 text-xs font-medium text-ink-700"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.native}
                    </option>
                  ))}
                </select>
              </div>
              {turns.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearConversation}
                  leadingIcon={<Trash2 className="size-3.5" aria-hidden="true" />}
                  aria-label="Clear conversation"
                >
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
            </div>
          </div>

          {/* Conversation */}
          <div
            className="flex-1 space-y-4 overflow-y-auto scrollbar-slim px-3 py-4 sm:px-4"
            role="log"
            aria-live="polite"
            aria-label="Conversation with Sahara AI"
          >
            {turns.length === 0 && (
              <div className="mx-auto max-w-lg py-6 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-800 ring-1 ring-brand-100">
                  <Sparkles className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-3 text-base font-semibold text-ink-900">What would you like to know?</h2>
                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-600">
                  Ask about a public service, a document, a complaint or a suspicious message. Sahara AI answers
                  from reviewed records and shows the source — or tells you plainly that it has none.
                </p>

                <div className="mt-4 space-y-1.5 text-start">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
                    Try one of these
                  </p>
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void ask(question)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-start text-sm text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                    >
                      <span>{question}</span>
                      <ArrowUp className="size-3.5 shrink-0 rotate-45 text-ink-300" aria-hidden="true" />
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
                <p className="font-medium">The assistant could not answer.</p>
                <p className="mt-0.5 text-xs leading-relaxed">{error}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => lastQuestionRef.current && void ask(lastQuestionRef.current)}>
                    Try again
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setError(null)}>
                    Dismiss
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
          <div className="border-t border-ink-200 bg-ink-50/60 p-2.5 sm:p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void ask(input);
              }}
              className="rounded-xl border border-ink-300 bg-white p-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Ask a question
              </label>
              <textarea
                id="assistant-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void ask(input);
                  }
                }}
                rows={2}
                maxLength={800}
                placeholder="Ask about a public service, document, complaint or suspicious message…"
                className="max-h-40 min-h-11 w-full resize-none border-0 bg-transparent px-2 py-1.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
              />
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1">
                  {speech.supported ? (
                    <button
                      type="button"
                      onClick={speech.listening ? speech.stop : speech.start}
                      aria-pressed={speech.listening}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                        speech.listening
                          ? 'bg-red-100 text-red-800'
                          : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
                      )}
                      title={speech.listening ? 'Stop recording' : 'Speak your question'}
                    >
                      {speech.listening ? (
                        <>
                          <MicOff className="size-3.5" aria-hidden="true" /> Stop
                        </>
                      ) : (
                        <>
                          <Mic className="size-3.5" aria-hidden="true" /> Speak
                        </>
                      )}
                    </button>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-400"
                      title="Voice input is not available in this browser. You can still type your question."
                    >
                      <MicOff className="size-3.5" aria-hidden="true" /> Voice unavailable
                    </span>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-600 hover:bg-ink-100">
                    <input
                      type="checkbox"
                      checked={speakAnswers}
                      onChange={(e) => setSpeakAnswers(e.target.checked)}
                      className="size-3.5 accent-brand-800"
                    />
                    Read answers aloud
                  </label>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="hidden text-[0.625rem] text-ink-400 sm:inline">{input.length}/800</span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={pending || !input.trim()}
                    aria-label="Send question"
                    className="size-8 !px-0"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </form>
            {speech.listening && (
              <p className="mt-1.5 px-2 text-xs text-red-700" role="status">
                Listening… your speech appears in the box so you can check it before sending.
              </p>
            )}
            {speech.error && (
              <p className="mt-1.5 px-2 text-xs text-amber-800" role="status">
                {speech.error} You can type your question instead.
              </p>
            )}
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <InlineNotice tone="info" title="How to read an answer">
            <p>
              The <strong>AI explanation</strong> explains the record. The{' '}
              <strong>source information</strong> block shows who published it and when it was last checked.
              If the two disagree, trust the source.
            </p>
          </InlineNotice>

          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-ink-900">Answer language</h2>
            <p className="mt-0.5 text-xs text-ink-500">
              The interface language and the answer language can differ — ask in Urdu and read the interface in
              English.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 min-[380px]:grid-cols-3">
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setAnswerLanguage(lang.id)}
                  aria-pressed={answerLanguage === lang.id}
                  className={cn(
                    'rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors',
                    answerLanguage === lang.id
                      ? 'border-brand-500 bg-brand-50 text-brand-900'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300',
                  )}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          {lastAnswer && (
            <div className="rounded-xl border border-ink-200 bg-white p-4">
              <h2 className="text-sm font-semibold text-ink-900">This answer</h2>
              <dl className="mt-2 space-y-1.5 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Intent</dt>
                  <dd className="font-medium text-ink-800">{lastAnswer.intent.replace(/_/g, ' ')}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Records retrieved</dt>
                  <dd className="font-medium text-ink-800 tabular">{lastAnswer.retrievedRecordCount}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Sources cited</dt>
                  <dd className="font-medium text-ink-800 tabular">{lastAnswer.sources.length}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-500">Engine</dt>
                  <dd className="font-medium text-ink-800">Demo retrieval</dd>
                </div>
              </dl>
              <p className="mt-2 border-t border-ink-100 pt-2 text-[0.6875rem] leading-relaxed text-ink-500">
                The language-model call is produced by the backend once the Gemini integration is connected. This
                build assembles the answer directly from the stored record.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
              <ShieldAlert className="size-4" aria-hidden="true" /> Never share secrets
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-amber-900">
              Do not type your password, OTP, PIN or full CNIC into this assistant. Sahara AI never asks for them,
              and anything you type here is processed as part of your question.
            </p>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-4 text-xs leading-relaxed text-ink-600">
            <p className="flex items-start gap-1.5">
              <Info className="mt-0.5 size-3.5 shrink-0 text-ink-400" aria-hidden="true" />
              Conversations are kept in this browser tab only (session storage). Clearing the conversation removes
              them.
            </p>
            {turns.length > 0 && (
              <Button variant="ghost" size="sm" className="mt-2" onClick={clearConversation} leadingIcon={<RotateCcw className="size-3.5" aria-hidden="true" />}>
                Start a new conversation
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
