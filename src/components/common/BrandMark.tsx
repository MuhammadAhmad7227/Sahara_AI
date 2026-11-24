import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/**
 * Sahara AI mark: a stylised shield/leaf ("sahara" = support) containing a
 * guiding spark. Drawn as inline SVG so it scales crisply and can be recoloured.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('size-9', className)} role="img" aria-label="Sahara AI logo">
      <rect width="40" height="40" rx="9" fill="currentColor" className="text-brand-900" />
      <path
        d="M20 7.5c4.6 2.9 7.6 7.7 7.6 13 0 6.7-3 11.1-7.6 12.9-4.6-1.8-7.6-6.2-7.6-12.9 0-5.3 3-10.1 7.6-13Z"
        fill="#ffffff"
        fillOpacity="0.13"
        stroke="#8fd3c5"
        strokeWidth="1.6"
      />
      <path d="M20 12v14" stroke="#8fd3c5" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M16.4 18.2c1.7 0 3-.7 3.6-1.8M23.6 18.2c-1.7 0-3-.7-3.6-1.8"
        stroke="#e8b86d"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="29.5" r="1.8" fill="#e8b86d" />
    </svg>
  );
}

export function BrandLockup({ compact }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
      aria-label="Sahara AI — home"
    >
      <BrandMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[0.9375rem] font-semibold tracking-tight text-ink-900">Sahara AI</span>
          <span className="mt-0.5 text-[0.625rem] font-medium uppercase tracking-wider text-ink-500">
            Civic assistant
          </span>
        </span>
      )}
    </Link>
  );
}
