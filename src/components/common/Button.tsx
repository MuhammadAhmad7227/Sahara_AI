/**
 * Button — the single button primitive for the whole application.
 * Renders as <button> by default, or as a router <Link> when `to` is provided.
 */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 font-medium text-center whitespace-normal rounded-lg select-none ' +
  'transition-[background-color,box-shadow,transform,border-color,color] duration-200 ease-out-soft ' +
  'disabled:pointer-events-none disabled:opacity-55 disabled:shadow-none';

/*
 * Depth rule: a button's shadow communicates how far it sits above the page.
 * Primary sits highest (you can press it), ghost sits flat (it is a label).
 */
const variants: Record<Variant, string> = {
  primary:
    'bg-brand-900 text-white shadow-2 shadow-bevel-dark hover:bg-brand-800 hover:shadow-3 active:shadow-1',
  secondary:
    'border border-sand-300 bg-sand-100 text-ink-900 shadow-1 hover:border-sand-400 hover:bg-sand-200 hover:shadow-2',
  outline:
    'border border-brand-900/15 bg-white text-ink-800 shadow-1 hover:border-brand-400 hover:text-brand-900 hover:shadow-2',
  ghost: 'text-ink-700 hover:bg-ink-100/80 hover:text-ink-950 active:bg-ink-200/70',
  danger: 'bg-red-700 text-white shadow-2 hover:bg-red-800 hover:shadow-3 active:shadow-1',
  subtle: 'bg-brand-50 text-brand-900 shadow-1 hover:bg-brand-100 hover:shadow-2',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'min-h-11 px-4 py-2 text-[0.9375rem]',
  lg: 'min-h-12 px-6 py-2.5 text-base',
};

/** Trailing icons drift in the fixed layout direction on hover. */
const iconDrift = '[&>[data-icon=trailing]]:transition-transform [&>[data-icon=trailing]]:duration-200 group-hover/btn:[&>[data-icon=trailing]]:translate-x-0.5';

export const buttonClasses = ({ variant = 'primary', size = 'md', fullWidth }: ButtonProps) =>
  cn(base, variants[variant], sizes[size], fullWidth && 'w-full');

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, leadingIcon, trailingIcon, fullWidth, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClasses({ variant, size, fullWidth }), iconDrift, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : leadingIcon}
      {children}
      {!loading && trailingIcon && <span data-icon="trailing" className="inline-flex">{trailingIcon}</span>}
    </button>
  );
});

interface LinkButtonProps {
  to: string;
  variant?: Variant;
  size?: Size;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

/** Same visual language as Button, but a real link (correct semantics for navigation). */
export function LinkButton({ to, variant = 'primary', size = 'md', leadingIcon, trailingIcon, fullWidth, className, children }: LinkButtonProps) {
  return (
    <Link to={to} className={cn(buttonClasses({ variant, size, fullWidth }), iconDrift, className)}>
      {leadingIcon}
      {children}
      {trailingIcon && <span data-icon="trailing" className="inline-flex">{trailingIcon}</span>}
    </Link>
  );
}
