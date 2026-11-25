/**
 * ProgressBar and StepIndicator.
 *
 * Both are presentational and accessible: the bar exposes `role="progressbar"`
 * with real `aria-valuenow`, and the stepper marks the current step with
 * `aria-current="step"` so a screen reader announces position without relying on
 * the visual connector.
 */
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'brand',
  size = 'md',
  showValue,
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  tone?: 'brand' | 'gold' | 'success' | 'warning';
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tones = {
    brand: 'bg-brand-800',
    gold: 'bg-accent-500',
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
  } as const;

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label && <span className="text-xs font-medium text-ink-600">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold tabular text-ink-800">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className={cn(
          'w-full overflow-hidden rounded-full bg-ink-200/80',
          size === 'sm' ? 'h-1' : 'h-1.5',
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out-soft', tones[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export interface StepIndicatorStep {
  id: string;
  label: string;
  description?: string;
}

/**
 * Vertical, numbered step list with a connected spine.
 * Used inside the application wizard and complaint assistant.
 */
export function StepIndicator({
  steps,
  current,
  className,
  compact,
}: {
  steps: StepIndicatorStep[];
  current: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <ol className={cn('relative space-y-0', className)}>
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        const last = index === steps.length - 1;

        return (
          <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
            {/* Connector */}
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute start-[0.9375rem] top-7 h-[calc(100%-1.25rem)] w-px',
                  done ? 'bg-brand-500' : 'bg-ink-200',
                )}
              />
            )}

            <span
              aria-hidden="true"
              className={cn(
                'relative z-10 grid size-7 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold transition-colors duration-300',
                done
                  ? 'bg-brand-800 text-white shadow-1'
                  : active
                    ? 'bg-accent-500 text-brand-950 ring-2 ring-accent-200'
                    : 'bg-white text-ink-500 ring-1 ring-ink-300',
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>

            <span className={cn('min-w-0 pt-0.5', compact && 'sr-only sm:not-sr-only')}>
              <span
                className={cn(
                  'block text-sm font-medium',
                  active ? 'text-ink-950' : done ? 'text-ink-700' : 'text-ink-500',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {step.label}
              </span>
              {step.description && !compact && (
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                  {step.description}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
