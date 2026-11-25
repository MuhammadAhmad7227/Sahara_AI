import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Info, Lock, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { SectionCard } from '@/components/common/Card';
import { PageHeader } from '@/components/common/Feedback';
import { EmptyState, InlineNotice } from '@/components/common/States';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ACCEPTED_EXTENSIONS, analyzeDocument, formatBytes, validateFile } from '@/services/api/documents';
import { errorMessage } from '@/services/api/errors';
import { cn, formatDate } from '@/utils/cn';
import type { DocumentAnalysis } from '@/types/domain';

export default function DocumentAnalyzerPage() {
  useDocumentTitle(
    'Document analyzer',
    'Upload a PDF or image to extract text and review flags. Review recommended for anything that matters — Sahara AI does not certify documents.',
  );

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<DocumentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const invalid = validateFile(candidate);
    if (invalid) {
      setFileError(invalid);
      setFile(null);
      return;
    }
    setFileError(null);
    setError(null);
    setResult(null);
    setProgress(0);
    setFile(candidate);
  };

  const run = async () => {
    if (!file || !consent) return;
    setProcessing(true);
    setError(null);
    setProgress(0);
    try {
      const analysis = await analyzeDocument(file, setProgress);
      setResult(analysis);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
    setError(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <PageHeader
        eyebrow="Document analyzer"
        title="Understand a document you already hold"
        description="Upload a PDF or image to extract text and see review flags. Upload only documents you are comfortable processing — and treat the output as a starting point, not a legal opinion."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_19rem]">
        <div className="min-w-0 space-y-4">
          <SectionCard title="1. Choose a file" description="PDF, JPG, PNG or WebP · maximum 10 MB.">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                chooseFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
                dragging ? 'border-brand-500 bg-brand-50/60' : 'border-ink-300 bg-ink-50/50',
              )}
            >
              <span className="grid size-11 place-items-center rounded-full bg-white text-brand-800 ring-1 ring-ink-200" aria-hidden="true">
                <UploadCloud className="size-5" />
              </span>
              <p className="mt-2 text-sm font-medium text-ink-900">Drag a file here, or choose one from your device</p>
              <p className="mt-0.5 text-xs text-ink-500">{ACCEPTED_EXTENSIONS.replaceAll(',', ' · ')}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => inputRef.current?.click()}>
                Choose file
              </Button>
              <input
                ref={inputRef}
                id="document-file"
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="sr-only"
                onChange={(e) => chooseFile(e.target.files?.[0])}
                aria-label="Choose a document to analyze"
              />
            </div>

            {fileError && (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {fileError}
              </p>
            )}

            {file && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <FileText className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{file.name}</p>
                    <p className="text-xs text-ink-500">
                      {formatBytes(file.size)} · {file.type || 'unknown type'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded p-1.5 text-ink-500 hover:bg-ink-100"
                  aria-label="Remove file"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </SectionCard>

          <SectionCard title="2. Consent and processing" description="Read this before you continue.">
            <div className="rounded-lg border border-ink-200 bg-ink-50/70 p-3 text-xs leading-relaxed text-ink-700">
              <p className="flex items-start gap-1.5">
                <Lock className="mt-0.5 size-3.5 shrink-0 text-brand-700" aria-hidden="true" />
                <span>
                  In this development build the file is validated in your browser and <strong>not uploaded
                  anywhere</strong>. When the backend is connected, text extraction requires sending the file to the
                  document service, and you will be asked for explicit consent before that happens.
                </span>
              </p>
            </div>

            <label className="mt-3 flex items-start gap-2 text-sm text-ink-800">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 size-4 accent-brand-800"
              />
              <span>
                I understand that I should only upload documents I am comfortable processing, and that the result is
                review guidance — not a legal or authenticity decision.
              </span>
            </label>

            {processing && (
              <div className="mt-3" role="status" aria-live="polite">
                <div className="mb-1 flex items-center justify-between text-xs text-ink-600">
                  <span>Processing…</span>
                  <span className="tabular">{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-200">
                  <div className="h-full rounded-full bg-brand-700 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
                {error}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={() => void run()} disabled={!file || !consent} loading={processing}>
                {processing ? 'Processing…' : 'Analyze document'}
              </Button>
              {result && (
                <Button variant="ghost" onClick={clearAll}>
                  Start over
                </Button>
              )}
            </div>
          </SectionCard>

          {result && (
            <>
              <SectionCard title="3. Result" description={`Processed ${formatDate(result.createdAt)}`}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-ink-200 bg-ink-50 p-3">
                    <p className="text-xs text-ink-500">File</p>
                    <p className="truncate text-sm font-medium text-ink-900">{result.fileName}</p>
                    <p className="text-xs text-ink-500">{formatBytes(result.fileSizeBytes)}</p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs text-amber-800">Review recommended</p>
                    <p className="text-sm font-medium text-amber-900">
                      {result.processedBy === 'local-heuristic' ? 'No extraction performed in demo mode' : 'Extraction complete'}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-ink-900">Extracted text</h3>
                  {result.extractedText ? (
                    <pre className="mt-1 max-h-60 overflow-auto rounded-lg border border-ink-200 bg-white p-3 text-xs whitespace-pre-wrap">
                      {result.extractedText}
                    </pre>
                  ) : (
                    <p className="mt-1 rounded-lg border border-dashed border-ink-300 bg-ink-50/60 p-3 text-sm text-ink-600">
                      No text was extracted. The OCR/vision extraction step runs on the backend; this build validates
                      your file and shows the interface state without pretending text was read.
                    </p>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="mb-1.5 text-sm font-semibold text-ink-900">Review flags</h3>
                  <ul className="space-y-2">
                    {result.flags.map((flag) => (
                      <li key={flag.id} className="flex items-start gap-2 rounded-lg border border-ink-200 p-2.5">
                        <Badge tone={flag.level === 'review' ? 'warning' : 'info'}>
                          {flag.level === 'review' ? 'Review recommended' : 'Note'}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-ink-900">{flag.label}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-600">{flag.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-ink-500">{result.disclaimer}</p>
              </SectionCard>
            </>
          )}

          {!result && !file && (
            <EmptyState
              icon={<FileText className="size-5" />}
              title="No document analyzed"
              description="Choose a file and give consent to see the processing states, extracted-text area and review flags."
            />
          )}
        </div>

        <aside className="space-y-4">
          <InlineNotice tone="warning" title="Only upload what you are comfortable with">
            <p>
              Identity documents contain sensitive information. Upload a document only if you understand how it will
              be processed and are comfortable with the stated retention rule.
            </p>
          </InlineNotice>

          <div className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" /> What the analyzer does
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-600">
              <li>· Validates file type and size in the browser.</li>
              <li>· Extracts text where the service supports the format.</li>
              <li>· Flags items that need your review.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <Info className="size-4 text-ink-400" aria-hidden="true" /> What it does not do
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-600">
              <li>· Certify a document as genuine or forged.</li>
              <li>· Give a legal opinion on a document.</li>
              <li>· Store your file beyond the stated retention rule.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
