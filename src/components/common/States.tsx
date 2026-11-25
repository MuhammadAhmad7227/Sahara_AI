/**
 * Loading, error and empty states — required on every data-driven page.
 * Each state is announced to assistive technology via role/aria-live.
 */
import type { ReactNode } from 'react';
import { AlertTriangle, Inbox, Loader2, WifiOff } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/common/Button';
import { useLanguage } from '@/contexts/LanguageContext';

export function LoadingSpinner({ className, label }: { className?: string; label?: string }) {
  const { t } = useLanguage();
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-ink-500', className)}>
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span>{label ?? t('state.loading')}</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-ink-200/60', className)}
      aria-hidden="true"
    >
      <span
        className="absolute inset-0 animate-shimmer"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 0.65) 45%, transparent 90%)',
          backgroundSize: '180% 100%',
        }}
      />
    </div>
  );
}

/** Skeleton block used while a list of cards loads. */
export function CardGridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: 2 | 3 }) {
  const { t } = useLanguage();
  const loadingLabel = t('state.loadingResults');
  return (
    <div
      className={cn('grid gap-4', columns === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2')}
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{loadingLabel}</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-brand-900/[0.07] bg-paper p-4 shadow-1">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-5 w-3/4" />
          <Skeleton className="mt-2 h-3.5 w-full" />
          <Skeleton className="mt-1.5 h-3.5 w-5/6" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  const { t } = useLanguage();
  const loadingLabel = t('state.loadingTable');
  return (
    <div className="space-y-2 p-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">{loadingLabel}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-32 sm:block" />
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-300 bg-white/60 px-6 py-12 text-center', className)}>
      <div className="mb-3 grid size-11 place-items-center rounded-full bg-ink-100 text-ink-500" aria-hidden="true">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  offline?: boolean;
  className?: string;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, offline, className }: ErrorStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50/50 px-6 py-12 text-center', className)}
      role="alert"
    >
      <div className="mb-3 grid size-11 place-items-center rounded-full bg-red-100 text-red-700" aria-hidden="true">
        {offline ? <WifiOff className="size-5" /> : <AlertTriangle className="size-5" />}
      </div>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-600">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

interface InlineNoticeProps {
  tone?: 'info' | 'warning' | 'success' | 'danger';
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

const noticeTones = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
};

export function InlineNotice({ tone = 'info', title, children, className, action }: InlineNoticeProps) {
  return (
    <div className={cn('rounded-lg border px-3.5 py-3 text-sm leading-relaxed', noticeTones[tone], className)} role="note">
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div className="space-y-1">{children}</div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
