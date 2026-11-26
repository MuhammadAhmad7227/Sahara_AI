/**
 * Drawer — a side panel that slides in from the logical end edge.
 *
 * Used on mobile for the assistant's sources panel, where a right-hand column
 * does not fit. The layout remains LTR, so it opens from the same side in every language.
 *
 * Accessibility: focus moves into the panel, `Escape` closes, background scroll
 * is locked, and the outer element carries `role="dialog"` + `aria-modal`.
 */
import { useId, useRef, type ReactNode } from 'react';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();

  const { t } = useLanguage();
  useDialogFocus(open, panelRef, onClose, closeRef);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' } as const;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t('action.close')}
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-brand-950/35 backdrop-blur-[2px] animate-fade-in"
      />
      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-label={title}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'absolute inset-y-0 end-0 flex w-full flex-col border-s border-ink-200 bg-paper shadow-4',
          widths[size],
        )}
        style={{ animation: 'slide-up 300ms var(--ease-out-soft) both' }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-ink-200/80 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink-950">{title}</h2>
            {description && <p id={descriptionId} className="mt-0.5 text-xs text-ink-600">{description}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            aria-label={t('action.close')}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="scrollbar-slim flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {footer && <div className="border-t border-ink-200/80 px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}
