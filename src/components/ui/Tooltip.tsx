/**
 * Tooltip — supplementary label on hover and focus.
 *
 * Deliberately CSS-driven (group-hover + group-focus-visible) so it works
 * without JavaScript state, and it is wired with `aria-describedby` so keyboard
 * and screen-reader users get the same information. Never use it for essential
 * content.
 */
import { useId, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Tooltip({
  label,
  children,
  side = 'top',
  className,
}: {
  label: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}) {
  const id = useId();

  return (
    <span className={cn('group/tt relative inline-flex', className)}>
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute start-1/2 z-50 w-max max-w-[15rem] -translate-x-1/2 rounded-lg bg-brand-950 px-2 py-1 text-[0.6875rem] font-medium leading-snug text-sand-100 opacity-0 shadow-3 transition-all duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100',
          side === 'top' ? 'bottom-full mb-1.5 translate-y-1 group-hover/tt:translate-y-0' : 'top-full mt-1.5 -translate-y-1 group-hover/tt:translate-y-0',
        )}
      >
        {label}
      </span>
    </span>
  );
}
