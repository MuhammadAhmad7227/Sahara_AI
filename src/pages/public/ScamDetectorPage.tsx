import { useRef, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  ScanLine,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button, LinkButton } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { EmptyState, InlineNotice } from '@/components/common/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { analyzeScam } from '@/services/api/scams';
import { validateFile, formatBytes } from '@/services/api/documents';
import { errorMessage } from '@/services/api/errors';
import { cn, formatDate } from '@/utils/cn';
import type { ScamAnalysis, ScamRiskLevel } from '@/types/domain';

const riskMeta: Record<ScamRiskLevel, { label: string; tone: string; Icon: typeof CheckCircle2; blurb: string }> = {
  high_concern: {
    label: 'High concern',
    tone: 'border-red-300 bg-red-50',
    Icon: AlertOctagon,
    blurb: 'Several strong fraud indicators were found. Do not act on this message until you verify it independently.',
  },
  needs_caution: {
    label: 'Needs caution',
    tone: 'border-amber-300 bg-amber-50',
    Icon: AlertTriangle,
    blurb: 'One caution indicator was found. Verify the sender through official contact details before responding.',
  },
  low_concern: {
    label: 'Low concern',
    tone: 'border-emerald-300 bg-emerald-50',
    Icon: CheckCircle2,
    blurb: 'No strong indicator matched the text you entered. That is not a guarantee that the message is genuine.',
  },
};

export default function ScamDetectorPage() {
  useDocumentTitle(
    'Scam detector',
    'Check a suspicious SMS, WhatsApp message or screenshot for known fraud indicators, with an explanation and safety steps. This is a risk assessment, not proof of fraud.',
  );

  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ScamAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const invalid = validateFile(file);
    if (invalid) {
      setFileError(invalid);
      setImage(null);
      return;
    }
    setFileError(null);
    setImage(file);
  };

  const analyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeScam(text);
      setAnalysis(result);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setText('');
    setImage(null);
    setFileError(null);
    setAnalysis(null);
    setError(null);
  };

  const meta = analysis ? riskMeta[analysis.riskLevel] : null;

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Scam detector"
        title="Check a suspicious message"
        description="Paste an SMS or WhatsApp message and Sahara AI will explain which known fraud indicators appear. Never share an OTP, PIN or password — Sahara AI will never ask for one either."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0 space-y-4">
          <SectionCard title="Message text" description="Paste the full message. Remove your own name and any account numbers if you prefer.">
            <label htmlFor="scam-text" className="sr-only">
              Message text
            </label>
            <textarea
              id="scam-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              maxLength={2000}
              placeholder={'Example: Dear customer, your account will be blocked within 2 hours. Share the OTP you received to verify your CNIC.'}
              className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2.5 text-sm leading-relaxed"
            />
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
              <span>
                {wordCount} words · {text.length}/2000 characters
              </span>
              <span>Text is analysed in your browser in this demo.</span>
            </div>

            {/* Optional screenshot */}
            <div className="mt-4 rounded-lg border border-dashed border-ink-300 bg-ink-50/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-start gap-2">
                  <ImageIcon className="mt-0.5 size-4 text-ink-400" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-ink-800">Add a screenshot (optional)</p>
                    <p className="text-xs text-ink-500">
                      Screenshot analysis requires the backend image service; you can attach a file now and the
                      upload is validated.
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} leadingIcon={<Upload className="size-3.5" aria-hidden="true" />}>
                  Choose file
                </Button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files?.[0])}
                aria-label="Attach a screenshot"
              />
              {image && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-md border border-ink-200 bg-white px-2.5 py-1.5 text-xs">
                  <span className="truncate text-ink-700">
                    {image.name} · {formatBytes(image.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="rounded p-1 text-ink-500 hover:bg-ink-100"
                    aria-label="Remove attached file"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
              {fileError && (
                <p className="mt-2 text-xs font-medium text-red-700" role="alert">
                  {fileError}
                </p>
              )}
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                onClick={() => void analyze()}
                loading={analyzing}
                disabled={!text.trim()}
                leadingIcon={<ScanLine className="size-4" aria-hidden="true" />}
              >
                {analyzing ? 'Analyzing…' : 'Analyze message'}
              </Button>
              {(text || analysis) && (
                <Button variant="ghost" onClick={reset}>
                  Clear
                </Button>
              )}
            </div>
          </SectionCard>

          {/* Results */}
          {analysis && meta && (
            <>
              <section className={cn('rounded-xl border-2 p-4 sm:p-5', meta.tone)} aria-labelledby="risk-level">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/70 text-ink-900">
                    <meta.Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-600">Risk level</p>
                    <h2 id="risk-level" className="text-lg font-semibold text-ink-900">
                      {meta.label}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-ink-800">{meta.blurb}</p>
                  </div>
                </div>
              </section>

              <SectionCard
                title="Detected indicators"
                description="Each indicator is a wording pattern, not a conclusion about the sender."
                action={<Badge tone={analysis.indicators.length ? 'warning' : 'success'}>{analysis.indicators.length} found</Badge>}
              >
                {analysis.indicators.length === 0 ? (
                  <EmptyState
                    icon={<ShieldCheck className="size-5" />}
                    title="No strong indicator matched"
                    description="A message can still be fraudulent even when no pattern matches. Verify the sender through official contact details."
                  />
                ) : (
                  <ul className="space-y-2.5">
                    {analysis.indicators.map((indicator) => (
                      <li key={indicator.id} className="rounded-lg border border-ink-200 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={indicator.severity === 'high' ? 'danger' : 'warning'}>
                            {indicator.severity} severity
                          </Badge>
                          <p className="text-sm font-semibold text-ink-900">{indicator.label}</p>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">{indicator.explanation}</p>
                        {indicator.evidence && (
                          <p className="mt-1.5 rounded bg-ink-50 px-2 py-1 font-mono text-xs text-ink-700">
                            Matched: “{indicator.evidence}”
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <SectionCard title="Why this was flagged" description="The explanation is generated from the indicator rules that matched.">
                <p className="text-sm leading-relaxed text-ink-700">{analysis.explanation}</p>
                <p className="mt-3 border-t border-ink-100 pt-2 text-xs text-ink-500">
                  Analysis type: {analysis.engine === 'rule-based-local' ? 'local rule-based scan (demo)' : 'AI service'} ·{' '}
                  {formatDate(analysis.createdAt)}
                </p>
              </SectionCard>

              <SectionCard title="What to do now" description="Practical steps, in order of urgency.">
                <ol className="space-y-2 text-sm leading-relaxed text-ink-700">
                  {analysis.safetyAdvice.map((advice, index) => (
                    <li key={index} className="flex gap-2.5">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-900 text-[0.625rem] font-semibold text-white" aria-hidden="true">
                        {index + 1}
                      </span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                  {analysis.disclaimer}
                </p>
              </SectionCard>
            </>
          )}

          {!analysis && !analyzing && (
            <EmptyState
              icon={<ScanLine className="size-5" />}
              title="No analysis yet"
              description="Paste a message above and choose Analyze message. The result explains which indicators appeared and why."
            />
          )}
        </div>

        <aside className="space-y-4">
          <InlineNotice tone="danger" title="Sahara AI never asks for secrets">
            <p>
              Do not enter your password, OTP, PIN or card number into any message you paste here. If a message asks
              for them, that alone is a strong warning sign.
            </p>
          </InlineNotice>

          <div className="rounded-xl border border-ink-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-ink-900">Common indicators</h2>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-600">
              <li>· Requests an OTP, PIN or password</li>
              <li>· Creates urgency with a short deadline</li>
              <li>· Asks for payment through a personal wallet</li>
              <li>· Links to a non-official domain</li>
              <li>· Announces a prize or lottery</li>
              <li>· Asks for CNIC, bank or card details</li>
              <li>· Claims to be a department or bank</li>
              <li>· Mentions SIM re-verification</li>
            </ul>
          </div>

          <div className="rounded-xl border border-ink-200 bg-white p-4 text-xs leading-relaxed text-ink-600">
            <h2 className="mb-1 text-sm font-semibold text-ink-900">If you already shared details</h2>
            <p>Contact your bank immediately using the number on your card, then report the incident to the official cybercrime channel.</p>
            <LinkButton to="/emergency" variant="outline" size="sm" className="mt-2">
              Emergency contacts
            </LinkButton>
          </div>
        </aside>
      </div>
    </div>
  );
}
