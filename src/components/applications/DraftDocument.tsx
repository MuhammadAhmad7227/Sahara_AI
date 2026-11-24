/**
 * DraftDocument — the preview of a generated application or complaint.
 *
 * The "DRAFT — NOT AN OFFICIAL GOVERNMENT FORM" band is part of the document
 * body, not a UI overlay, so it survives copying, printing and PDF export.
 */
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import type { ApplicationDraft } from '@/types/domain';

interface DraftDocumentProps {
  draft: Pick<ApplicationDraft, 'templateName' | 'department' | 'body' | 'createdAt'>;
  className?: string;
  /** Extra footer note shown under the draft band. */
  note?: string;
}

export const DraftDocument = forwardRef<HTMLDivElement, DraftDocumentProps>(function DraftDocument(
  { draft, className, note },
  ref,
) {
  const date = new Date(draft.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div ref={ref} className={cn('paper-sheet mx-auto w-full max-w-2xl', className)}>
      <div
        className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-dashed border-amber-500 bg-amber-50 px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-wider text-amber-900"
        role="note"
      >
        <span>Draft — not an official government form</span>
        <span className="font-medium normal-case tracking-normal text-amber-800">
          Prepared with Sahara AI · {date}
        </span>
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-ink-200 pb-4">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
              Draft {draft.templateName}
            </p>
            <p className="mt-0.5 text-sm font-medium text-ink-800">{draft.department}</p>
          </div>
          <div className="text-end text-[0.6875rem] text-ink-400">
            <p>For submission by the applicant</p>
            <p className="tabular">{date}</p>
          </div>
        </div>

        <pre
          className="whitespace-pre-wrap break-words font-sans text-[0.875rem] leading-[1.9] text-ink-800"
          // The draft body is user-authored content rendered as text (never HTML).
          aria-label="Draft document text"
        >
          {draft.body}
        </pre>

        <div className="mt-6 border-t border-ink-200 pt-3 text-[0.6875rem] leading-relaxed text-ink-500">
          <p>
            You are responsible for reviewing every line of this draft before submitting it. Sahara AI did
            not submit this document and cannot submit it on your behalf.
          </p>
          {note && <p className="mt-1">{note}</p>}
        </div>
      </div>
    </div>
  );
});
