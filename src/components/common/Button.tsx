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
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors duration-150 rounded-lg select-none disabled:pointer-events-none disabled:opacity-55';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950 shadow-sm',
  secondary: 'bg-sand-100 text-ink-900 border border-sand-300 hover:bg-sand-200',
  outline: 'border border-ink-300 bg-white text-ink-800 hover:border-brand-400 hover:text-brand-800',
  ghost: 'text-ink-700 hover:bg-ink-100',
  danger: 'bg-red-700 text-white hover:bg-red-800',
  subtle: 'bg-brand-50 text-brand-900 hover:bg-brand-100',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
};

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
      className={cn(buttonClasses({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
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
    <Link to={to} className={cn(buttonClasses({ variant, size, fullWidth }), className)}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </Link>
  );
}
