/** Card surfaces used across the product. */
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-xl border border-ink-200 bg-white shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}

interface SectionCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  /** Remove inner padding for tables and edge-to-edge content. */
  flush?: boolean;
}

export function SectionCard({
  title,
  description,
  action,
  footer,
  flush,
  className,
  children,
  ...rest
}: SectionCardProps) {
  return (
    <section
      className={cn('rounded-xl border border-ink-200 bg-white shadow-card', className)}
      {...rest}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink-100 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-ink-900">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(!flush && 'px-4 py-4 sm:px-5 sm:py-5')}>{children}</div>
      {footer && <div className="border-t border-ink-100 px-4 py-3 sm:px-5">{footer}</div>}
    </section>
  );
}
