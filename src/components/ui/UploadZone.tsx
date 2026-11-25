/**
 * UploadZone — drag-and-drop file input with validation feedback.
 *
 * Validation itself lives in the service layer (`services/api/documents.ts`), so
 * the same rules run whether the user drops a file here or calls the API from a
 * test. This component only renders the outcome.
 */
import { useCallback, useId, useRef, useState, type ReactNode } from 'react';
import { FileUp, FileText, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatBytes } from '@/services/api/documents';

export function UploadZone({
  onFile,
  accept,
  hint,
  file,
  onClear,
  disabled,
  icon,
  validate,
  className,
}: {
  onFile: (file: File) => void;
  accept?: string;
  hint?: string;
  file?: File | null;
  onClear?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  /** Return an error string, or null when the file is acceptable. */
  validate?: (file: File) => string | null;
  className?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    (candidate: File | undefined) => {
      if (!candidate) return;
      const problem = validate?.(candidate) ?? null;
      setError(problem);
      if (!problem) onFile(candidate);
    },
    [onFile, validate],
  );

  if (file) {
    return (
      <div className={cn('flex items-center gap-3 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 p-3 shadow-1', className)}>
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-800 ring-1 ring-brand-100">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-900">{file.name}</p>
          <p className="text-xs text-ink-500">
            {formatBytes(file.size)}
            <span className="ms-1.5 rounded bg-ink-100 px-1 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-ink-600">
              not uploaded — processed in this browser
            </span>
          </p>
        </div>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="grid size-8 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            aria-label={`Remove ${file.name}`}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
          disabled
            ? 'cursor-not-allowed border-ink-200 bg-ink-50/60'
            : dragging
              ? 'border-brand-500 bg-brand-50 scale-[1.01]'
              : 'border-ink-300 bg-sand-50/60 hover:border-brand-400 hover:bg-brand-50/40',
        )}
      >
        <span
          className={cn(
            'mx-auto grid size-12 place-items-center rounded-full bg-white text-brand-800 shadow-2 ring-1 ring-ink-200',
            dragging && 'scale-105',
          )}
        >
          {icon ?? <FileUp className="size-5" aria-hidden="true" />}
        </span>

        <p className="mt-3 text-sm font-medium text-ink-900">
          <label
            htmlFor={inputId}
            className={cn('cursor-pointer rounded text-brand-800 underline underline-offset-2', disabled && 'pointer-events-none text-ink-400 no-underline')}
          >
            Choose a file
          </label>{' '}
          or drag it here
        </p>
        {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}

        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            handle(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-red-700">
          <X className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
