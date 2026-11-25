import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

/**
 * Sahara AI mark.
 *
 * A deep-green civic seal containing a gold-lit core and a horizon line — the
 * "sahara" is the desert floor, the gold is the light that carries information.
 * Drawn as inline SVG with explicit fills so it stays crisp at 20px and 200px,
 * and carries no external asset request.
 *
 * It deliberately does NOT resemble a government emblem: no crescent, no star,
 * no laurel. Sahara AI is an independent civic assistant.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('size-9', className)}
      role="img"
      aria-label="Sahara AI"
    >
      <defs>
        <linearGradient id="sahara-seal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b4535" />
          <stop offset="60%" stopColor="#063b2e" />
          <stop offset="100%" stopColor="#032018" />
        </linearGradient>
        <radialGradient id="sahara-core" cx="36%" cy="30%" r="76%">
          <stop offset="0%" stopColor="#fdf7e3" />
          <stop offset="42%" stopColor="#e8d8b5" />
          <stop offset="100%" stopColor="#c9a227" />
        </radialGradient>
      </defs>

      {/* Seal */}
      <rect width="48" height="48" rx="13" fill="url(#sahara-seal)" />
      <rect
        x="0.75"
        y="0.75"
        width="46.5"
        height="46.5"
        rx="12.25"
        fill="none"
        stroke="rgb(255 255 255 / 0.14)"
        strokeWidth="1.5"
      />

      {/* Hairline orbit */}
      <circle cx="24" cy="23" r="15" fill="none" stroke="rgb(227 199 102 / 0.45)" strokeWidth="1" />
      <circle
        cx="24"
        cy="23"
        r="15"
        fill="none"
        stroke="rgb(255 255 255 / 0.55)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="5 89"
        transform="rotate(-38 24 23)"
      />

      {/* Core */}
      <circle cx="24" cy="23" r="8" fill="url(#sahara-core)" />
      <ellipse cx="21.2" cy="20" rx="2.4" ry="1.7" fill="rgb(255 255 255 / 0.72)" />

      {/* Horizon: the desert line, and the light above it */}
      <path d="M13 34.5h22" stroke="rgb(232 216 181 / 0.55)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 38.5h12" stroke="rgb(201 162 39 / 0.6)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function BrandLockup({ compact, onDark }: { compact?: boolean; onDark?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
      aria-label="Sahara AI — home"
    >
      <BrandMark className="size-9 transition-transform duration-300 group-hover:-translate-y-px" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[0.9375rem] font-semibold tracking-tight',
              onDark ? 'text-white' : 'text-ink-950',
            )}
          >
            Sahara AI
          </span>
          <span
            className={cn(
              'mt-1 text-[0.625rem] font-medium uppercase tracking-[0.14em]',
              onDark ? 'text-sand-300/80' : 'text-ink-500',
            )}
          >
            Civic assistant
          </span>
        </span>
      )}
    </Link>
  );
}
