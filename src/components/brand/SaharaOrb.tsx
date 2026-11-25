/**
 * SaharaOrb — the product's signature mark.
 *
 * Concept: a deep-green civic seal with a warm gold core. It reads as a *seal*
 * (authority, verification) rather than a generic glowing AI ball: a solid outer
 * ring, two counter-rotating hairlines, a sand-lit centre and a few fixed
 * particles that suggest desert dust rather than "magic".
 *
 * Implementation notes
 *  - Pure CSS transforms + SVG. No canvas, no animation loop, no 3D library, so
 *    it costs nothing on a low-end Android phone.
 *  - Particles use fixed coordinates, not Math.random(), so the render is stable
 *    and snapshot-testable.
 *  - Every animation is disabled under prefers-reduced-motion by the global rule
 *    in styles/index.css, which leaves a perfectly good static orb.
 */
import { useId } from 'react';
import { cn } from '@/utils/cn';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'responding' | 'error';

const stateLabel: Record<OrbState, string> = {
  idle: 'Sahara AI is ready',
  listening: 'Sahara AI is listening',
  thinking: 'Sahara AI is checking reviewed sources',
  responding: 'Sahara AI is answering',
  error: 'Sahara AI could not answer',
};

/** Fixed dust positions: [x%, y%, size(px), opacity] around the outer ring. */
const particles: Array<[number, number, number, number]> = [
  [12, 30, 3, 0.5],
  [86, 22, 2, 0.45],
  [92, 62, 2.5, 0.35],
  [22, 84, 2, 0.4],
  [68, 90, 3, 0.28],
  [4, 58, 2, 0.3],
  [46, 6, 2, 0.35],
];

export function SaharaOrb({
  state = 'idle',
  size = 96,
  className,
  label,
}: {
  state?: OrbState;
  /** Rendered diameter in px. The internal geometry scales with it. */
  size?: number;
  className?: string;
  /** Override the screen-reader label (defaults to a state description). */
  label?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const coreId = `orb-core-${uid}`;
  const glowId = `orb-glow-${uid}`;
  const rimId = `orb-rim-${uid}`;

  const isError = state === 'error';
  const isBusy = state === 'thinking';
  const isListening = state === 'listening';

  return (
    <div
      role="img"
      aria-label={label ?? stateLabel[state]}
      data-orb-state={state}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      {/* Ambient light spilling onto the surrounding surface. */}
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full blur-2xl transition-opacity duration-700',
          isError ? 'opacity-40' : 'opacity-70',
        )}
        style={{
          background: isError
            ? 'radial-gradient(circle at 50% 45%, rgb(190 60 50 / 0.42), transparent 68%)'
            : 'radial-gradient(circle at 50% 45%, rgb(201 162 39 / 0.42), transparent 68%)',
        }}
      />

      {/* Outer seal: solid ring, slightly thicker at the bottom (light from above). */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <linearGradient id={rimId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b4535" />
            <stop offset="55%" stopColor="#063b2e" />
            <stop offset="100%" stopColor="#032018" />
          </linearGradient>
          <radialGradient id={coreId} cx="38%" cy="32%" r="72%">
            <stop offset="0%" stopColor="#fdf7e3" />
            <stop offset="34%" stopColor="#e8d8b5" />
            <stop offset="68%" stopColor="#c9a227" />
            <stop offset="100%" stopColor="#866717" />
          </radialGradient>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="#c9a227" stopOpacity="0" />
            <stop offset="100%" stopColor="#c9a227" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* Ring body */}
        <circle cx="60" cy="60" r="55" fill={`url(#${rimId})`} />
        {/* Inner lip — the bevel that creates the sense of thickness */}
        <circle cx="60" cy="60" r="50.5" fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth="1.4" />
        <circle cx="60" cy="60" r="43" fill={`url(#${glowId})`} />
      </svg>

      {/* Counter-rotating hairline arcs. Slowly rotated by CSS. */}
      <svg viewBox="0 0 120 120" className="absolute inset-0 size-full" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r="47"
          fill="none"
          stroke="#e3c766"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="36 258"
          opacity="0.75"
          className="origin-center animate-orb-spin-slow"
        />
        <circle
          cx="60"
          cy="60"
          r="47"
          fill="none"
          stroke="rgb(255 255 255 / 0.5)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="10 285"
          opacity="0.65"
          className="origin-center animate-orb-spin-reverse"
        />
      </svg>

      {/* Core */}
      <span
        aria-hidden="true"
        className={cn(
          'relative rounded-full',
          isBusy ? 'animate-orb-think' : 'animate-orb-breathe',
        )}
        style={{
          width: size * 0.56,
          height: size * 0.56,
          background: isError
            ? 'radial-gradient(circle at 38% 32%, #fbeaea 0%, #e7a9a1 38%, #a4413a 76%, #6d2620 100%)'
            : `url(#${coreId})`,
          boxShadow: isError
            ? '0 0 18px rgb(164 65 58 / 0.45), inset 0 1px 2px rgb(255 255 255 / 0.6)'
            : '0 0 22px rgb(201 162 39 / 0.42), inset 0 1px 2px rgb(255 255 255 / 0.65)',
        }}
      >
        {/* Specular highlight — a single soft light source, upper-left. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            inset: '12% 42% 58% 14%',
            background: 'radial-gradient(circle, rgb(255 255 255 / 0.85), transparent 70%)',
          }}
        />
      </span>

      {/* Listening rings: two expanding halos, offset in time. */}
      {isListening && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border border-accent-300/70 animate-orb-ring"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border border-accent-300/50 animate-orb-ring"
            style={{ animationDelay: '0.55s' }}
          />
        </>
      )}

      {/* Dust particles — the Sahara signature. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0">
        {particles.map(([x, y, s, o], i) => (
          <span
            key={i}
            className={cn(
              'absolute rounded-full bg-accent-300',
              state === 'idle' && 'animate-pulse-soft',
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: s,
              height: s,
              opacity: o,
              animationDelay: `${i * 0.42}s`,
            }}
          />
        ))}
      </span>
    </div>
  );
}

/**
 * Compact inline orb used in headers, avatars and message rows.
 * Same visual language, simplified geometry for small sizes.
 */
export function OrbDot({ state = 'idle', className }: { state?: OrbState; className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-grid size-6 shrink-0 place-items-center rounded-full',
        className,
      )}
      style={{ background: 'linear-gradient(160deg, #0b4535, #032018)' }}
      aria-hidden="true"
    >
      <span
        className={cn('size-2.5 rounded-full', state === 'thinking' && 'animate-orb-think')}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #fdf7e3, #c9a227 70%, #866717)',
        }}
      />
    </span>
  );
}
