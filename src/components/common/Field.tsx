/**
 * Form controls: Input, Textarea, Select, Checkbox, Radio, Field wrapper.
 * Every control has: a label bound with htmlFor, a described-by chain for help
 * and error text, aria-invalid, and a visible error message.
 */
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

const controlBase =
  'w-full rounded-lg border bg-white text-ink-900 placeholder:text-ink-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:border-brand-500 disabled:bg-ink-100 disabled:text-ink-500';

const controlState = (error?: string) =>
  error ? 'border-red-400 focus-visible:ring-red-400/40 focus-visible:border-red-500' : 'border-ink-300 hover:border-ink-400';

interface FieldShellProps {
  id: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  optionalHint?: string;
  children: ReactNode;
  className?: string;
  helpId: string;
  errorId: string;
}

function FieldShell({ id, label, help, error, required, optionalHint, children, className, helpId, errorId }: FieldShellProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink-800">
        {label}
        {required ? (
          <span className="ms-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : (
          optionalHint && <span className="ms-1.5 text-xs font-normal text-ink-500">{optionalHint}</span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {help && !error && (
        <p id={helpId} className="text-xs leading-relaxed text-ink-500">
          {help}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs font-medium text-red-700" role="alert">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

interface BaseProps {
  label: string;
  help?: string;
  error?: string;
  containerClassName?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseProps {
  leadingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, help, error, containerClassName, className, id, leadingIcon, required, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  return (
    <FieldShell
      id={inputId}
      label={label}
      help={help}
      error={error}
      required={required}
      optionalHint={!required ? 'optional' : undefined}
      className={containerClassName}
      helpId={helpId}
      errorId={errorId}
    >
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-ink-400" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(help && helpId, error && errorId) || undefined}
          className={cn('h-11 px-3 text-[0.9375rem]', leadingIcon && 'ps-9', controlBase, controlState(error), className)}
          {...rest}
        />
      </div>
    </FieldShell>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseProps {
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, help, error, containerClassName, className, id, required, showCount, maxLength, value, ...rest },
  ref,
) {
  const autoId = useId();
  const areaId = id ?? autoId;
  const helpId = `${areaId}-help`;
  const errorId = `${areaId}-error`;
  const count = typeof value === 'string' ? value.length : 0;

  return (
    <FieldShell
      id={areaId}
      label={label}
      help={help}
      error={error}
      required={required}
      optionalHint={!required ? 'optional' : undefined}
      className={containerClassName}
      helpId={helpId}
      errorId={errorId}
    >
      <textarea
        ref={ref}
        id={areaId}
        required={required}
        maxLength={maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(help && helpId, error && errorId) || undefined}
        className={cn('min-h-28 px-3 py-2.5 text-[0.9375rem] leading-relaxed', controlBase, controlState(error), className)}
        {...rest}
      />
      {showCount && maxLength && (
        <p className="text-end text-xs text-ink-400 tabular" aria-hidden="true">
          {count}/{maxLength}
        </p>
      )}
    </FieldShell>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseProps {
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, help, error, containerClassName, className, id, options, placeholder, required, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const helpId = `${selectId}-help`;
  const errorId = `${selectId}-error`;

  return (
    <FieldShell
      id={selectId}
      label={label}
      help={help}
      error={error}
      required={required}
      optionalHint={!required ? 'optional' : undefined}
      className={containerClassName}
      helpId={helpId}
      errorId={errorId}
    >
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(help && helpId, error && errorId) || undefined}
        className={cn('h-11 px-3 pe-9 text-[0.9375rem]', controlBase, controlState(error), className)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled={!!required}>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});

/* -------------------------------------------------------------------------- */
/* Checkbox & Radio                                                           */
/* -------------------------------------------------------------------------- */

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const boxId = id ?? autoId;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        ref={ref}
        type="checkbox"
        id={boxId}
        aria-invalid={error ? true : undefined}
        className="mt-0.5 size-4.5 shrink-0 rounded border-ink-400 text-brand-700 accent-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        {...rest}
      />
      <div className="min-w-0">
        <label htmlFor={boxId} className="text-sm text-ink-800">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
        {error && (
          <p className="mt-1 text-xs font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

interface RadioGroupProps {
  legend: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  error?: string;
  className?: string;
}

export function RadioGroup({ legend, name, value, onChange, options, error, className }: RadioGroupProps) {
  const groupId = useId();
  return (
    <fieldset className={cn('space-y-2', className)} aria-describedby={error ? `${groupId}-error` : undefined}>
      <legend className="text-sm font-medium text-ink-800">{legend}</legend>
      <div className="space-y-2">
        {options.map((opt) => {
          const id = `${groupId}-${opt.value}`;
          return (
            <div
              key={opt.value}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                value === opt.value ? 'border-brand-500 bg-brand-50/60' : 'border-ink-200 hover:border-ink-300',
              )}
            >
              <input
                type="radio"
                id={id}
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="mt-0.5 size-4 accent-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              />
              <div className="min-w-0">
                <label htmlFor={id} className="block text-sm font-medium text-ink-900">
                  {opt.label}
                </label>
                {opt.description && <p className="mt-0.5 text-xs text-ink-500">{opt.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={`${groupId}-error`} className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
