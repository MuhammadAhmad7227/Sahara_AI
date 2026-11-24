import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface WizardStep {
  id: string;
  label: string;
}

/**
 * Horizontal stepper with an accessible summary of progress.
 * Collapses to a compact "Step n of m" line on small screens.
 */
export function WizardProgress({
  steps,
  current,
  onStepClick,
  maxReachable,
}: {
  steps: WizardStep[];
  current: number;
  onStepClick?: (index: number) => void;
  /** Highest step the user may jump to (validated progress). */
  maxReachable: number;
}) {
  return (
    <nav aria-label="Progress">
      <p className="mb-2 text-xs font-medium text-ink-500 sm:hidden" aria-live="polite">
        Step {current + 1} of {steps.length}: <span className="font-semibold text-ink-800">{steps[current]?.label}</span>
      </p>

      <ol className="hidden items-center gap-1 sm:flex">
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const reachable = index <= maxReachable;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-1">
              <button
                type="button"
                disabled={!reachable || !onStepClick}
                onClick={() => onStepClick?.(index)}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'group flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-1 text-start',
                  reachable && onStepClick ? 'hover:bg-ink-50' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full text-[0.6875rem] font-semibold ring-1',
                    done && 'bg-brand-900 text-white ring-brand-900',
                    active && 'bg-brand-50 text-brand-900 ring-brand-600',
                    !done && !active && 'bg-white text-ink-400 ring-ink-300',
                  )}
                  aria-hidden="true"
                >
                  {done ? <Check className="size-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'truncate text-xs',
                    active ? 'font-semibold text-ink-900' : 'text-ink-500',
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  className={cn('h-px w-3 shrink-0 sm:w-4', done ? 'bg-brand-700' : 'bg-ink-200')}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="sm:hidden">
        <div className="h-1.5 overflow-hidden rounded-full bg-ink-200" role="presentation">
          <div
            className="h-full rounded-full bg-brand-700 transition-all"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-[0.6875rem] text-ink-500">{steps[current]?.label}</p>
      </div>
    </nav>
  );
}
