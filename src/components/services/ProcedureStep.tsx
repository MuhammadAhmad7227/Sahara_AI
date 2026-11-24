import { MapPin, Timer } from 'lucide-react';
import type { ProcedureStep as ProcedureStepType } from '@/types/domain';

export function ProcedureStep({ step, isLast }: { step: ProcedureStepType; isLast?: boolean }) {
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast && (
        <span
          className="absolute start-[0.9375rem] top-8 bottom-0 w-px bg-ink-200"
          aria-hidden="true"
        />
      )}
      <span
        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-900 text-xs font-semibold text-white tabular"
        aria-hidden="true"
      >
        {step.stepNumber}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-sm font-semibold text-ink-900">
          <span className="sr-only">Step {step.stepNumber}: </span>
          {step.title}
        </h4>
        <p className="mt-1 text-sm leading-relaxed text-ink-600">{step.instruction}</p>
        {(step.location || step.estimatedDuration) && (
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
            {step.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" aria-hidden="true" />
                {step.location}
              </span>
            )}
            {step.estimatedDuration && (
              <span className="inline-flex items-center gap-1">
                <Timer className="size-3" aria-hidden="true" />
                {step.estimatedDuration}
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
