/**
 * Page-level primitives: PageHeader, Breadcrumbs, Prose, Stat, Pagination, Tabs,
 * Accordion, Modal, Toast.
 */
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, X, CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { useLanguage } from '@/contexts/LanguageContext';

/* -------------------------------------------------------------------------- */
/* Page header & breadcrumbs                                                  */
/* -------------------------------------------------------------------------- */

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, eyebrow, actions, children, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="mb-1.5 flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-700">
            <span className="h-px w-5 bg-accent-500" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-[1.6rem] font-semibold tracking-[-0.025em] text-ink-950 sm:text-[1.9rem]">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:text-[0.9375rem]">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </header>
  );
}

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.to && !last ? (
                <Link to={item.to} className="rounded hover:text-brand-800 hover:underline underline-offset-2">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={cn(last && 'font-medium text-ink-700')}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3 text-ink-300 dir-arrow" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Prose                                                                      */
/* -------------------------------------------------------------------------- */

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('space-y-3 text-[0.9375rem] leading-relaxed text-ink-700', className)}>{children}</div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat                                                                       */
/* -------------------------------------------------------------------------- */

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'warning' | 'success';
}) {
  return (
    <div className="rounded-xl border border-brand-900/[0.07] bg-paper shadow-1 px-4 py-3.5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold tabular',
          tone === 'warning' && 'text-amber-700',
          tone === 'success' && 'text-emerald-700',
          tone === 'default' && 'text-ink-900',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pagination                                                                 */
/* -------------------------------------------------------------------------- */

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 pt-2">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-ink-300 px-3 text-sm text-ink-700 hover:border-brand-400 disabled:opacity-40"
      >
        <ChevronLeft className="size-4 dir-arrow" aria-hidden="true" />
        Previous
      </button>
      <p className="text-xs text-ink-500 tabular">
        Page {page} of {totalPages}
      </p>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-9 items-center gap-1 rounded-lg border border-ink-300 px-3 text-sm text-ink-700 hover:border-brand-400 disabled:opacity-40"
      >
        Next
        <ChevronRight className="size-4 dir-arrow" aria-hidden="true" />
      </button>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                       */
/* -------------------------------------------------------------------------- */

interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({
  items,
  active,
  onChange,
  label = 'Sections',
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn('border-b border-ink-200', className)} role="tablist" aria-label={label}>
      <div className="-mb-px flex gap-1 overflow-x-auto scrollbar-slim">
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(item.id)}
              className={cn(
                'shrink-0 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                selected
                  ? 'border-brand-700 text-brand-900'
                  : 'border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800',
              )}
            >
              {item.label}
              {typeof item.count === 'number' && (
                <span className="ms-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[0.6875rem] text-ink-600 tabular">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Accordion                                                                  */
/* -------------------------------------------------------------------------- */

export function Accordion({
  items,
  defaultOpen,
}: {
  items: { id: string; title: string; content: ReactNode }[];
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const base = useId();

  return (
    <div className="divide-y divide-ink-200 rounded-xl border border-brand-900/[0.07] bg-paper shadow-1">
      {items.map((item) => {
        const expanded = open === item.id;
        const panelId = `${base}-${item.id}-panel`;
        const buttonId = `${base}-${item.id}-button`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : item.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start text-sm font-medium text-ink-900 hover:bg-ink-50"
              >
                {item.title}
                <ChevronDown
                  className={cn('size-4 shrink-0 text-ink-400 transition-transform', expanded && 'rotate-180')}
                  aria-hidden="true"
                />
              </button>
            </h3>
            {expanded && (
              <div id={panelId} role="region" aria-labelledby={buttonId} className="px-4 pb-4 text-sm text-ink-600 animate-fade-in">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

export function Modal({
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
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const { t } = useLanguage();
  useDialogFocus(open, panelRef, onClose);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/45 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'relative z-10 max-h-[92dvh] w-full overflow-y-auto scrollbar-slim rounded-t-xl bg-white p-5 shadow-overlay animate-slide-up sm:rounded-xl',
          size === 'sm' && 'sm:max-w-sm',
          size === 'md' && 'sm:max-w-lg',
          size === 'lg' && 'sm:max-w-2xl',
        )}
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-ink-900">
              {title}
            </h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-ink-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
            aria-label={t('action.close')}
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-4 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Toast                                                                      */
/* -------------------------------------------------------------------------- */

type ToastTone = 'success' | 'info' | 'warning' | 'error';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastIcons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const toastTones = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-red-200 bg-red-50 text-red-900',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const toast = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = ++counter.current;
    setToasts((current) => [...current, { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const Icon = toastIcons[t.tone];
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-lg border px-3.5 py-2.5 text-sm shadow-raised animate-slide-up',
                toastTones[t.tone],
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
