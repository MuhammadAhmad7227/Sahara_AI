/**
 * RequirementItem — used read-only on the service detail page, and as an
 * interactive three-state control on the readiness checker.
 */
import { Check, CircleDashed, FileWarning } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { cn } from '@/utils/cn';
import type { ReadinessItemState, Requirement } from '@/types/domain';

export function RequirementItem({ requirement }: { requirement: Requirement }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <span
        className={cn(
          'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ring-1',
          requirement.mandatory
            ? 'bg-brand-50 text-brand-800 ring-brand-200'
            : 'bg-ink-100 text-ink-500 ring-ink-200',
        )}
        aria-hidden="true"
      >
        <Check className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-ink-900">{requirement.title}</p>
          <Badge tone={requirement.mandatory ? 'brand' : 'neutral'}>
            {requirement.mandatory ? 'Required' : 'Optional'}
          </Badge>
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-600">{requirement.details}</p>
      </div>
    </li>
  );
}

const stateMeta: Record<ReadinessItemState, { label: string; className: string; Icon: typeof Check }> = {
  complete: { label: 'Complete', className: 'border-emerald-300 bg-emerald-50 text-emerald-900', Icon: Check },
  missing: { label: 'Missing', className: 'border-red-300 bg-red-50 text-red-900', Icon: FileWarning },
  needs_review: { label: 'Needs review', className: 'border-amber-300 bg-amber-50 text-amber-900', Icon: CircleDashed },
};

export function ReadinessControl({
  requirement,
  state,
  onChange,
}: {
  requirement: Requirement;
  state: ReadinessItemState;
  onChange: (state: ReadinessItemState) => void;
}) {
  const meta = stateMeta[state];
  return (
    <li className={cn('rounded-lg border p-3 transition-colors', meta.className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{requirement.title}</p>
            <Badge tone={requirement.mandatory ? 'brand' : 'neutral'}>
              {requirement.mandatory ? 'Required' : 'Optional'}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs opacity-90">{requirement.details}</p>
        </div>

        <div
          className="flex shrink-0 rounded-md border border-current/25 bg-white/70 p-0.5"
          role="group"
          aria-label={`Status for ${requirement.title}`}
        >
          {(Object.keys(stateMeta) as ReadinessItemState[]).map((key) => {
            const option = stateMeta[key];
            const selected = state === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(key)}
                className={cn(
                  'inline-flex items-center gap-1 rounded px-2 py-1 text-[0.6875rem] font-medium transition-colors',
                  selected ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                <option.Icon className="size-3" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
}
