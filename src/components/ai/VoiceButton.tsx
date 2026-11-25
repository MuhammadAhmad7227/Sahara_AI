/**
 * VoiceButton — the microphone control with a complete state machine.
 *
 * HONESTY: the browser Web Speech API is not available everywhere and is
 * unreliable in some Android WebViews. Rather than faking a listening state, the
 * component receives its state from `useSpeechRecognition` and renders an
 * explicit "not supported" state when the hook reports it. The parent decides
 * what to do; this component never pretends to hear anything.
 */
import { Mic, Square, Loader2, MicOff, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'unsupported';

const labels: Record<VoiceState, string> = {
  idle: 'Speak your question',
  listening: 'Listening — tap to stop',
  processing: 'Processing your speech',
  speaking: 'Sahara AI is speaking',
  error: 'Voice input failed — try again',
  unsupported: 'Voice input is not available in this browser',
};

export function VoiceButton({
  state = 'idle',
  onClick,
  className,
  size = 'md',
  language,
}: {
  state?: VoiceState;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** BCP-47 tag shown as a tiny badge so the user knows what is being heard. */
  language?: string;
}) {
  const disabled = state === 'unsupported' || state === 'processing';
  const dims = size === 'sm' ? 'size-9' : size === 'lg' ? 'size-14' : 'size-11';

  return (
    <span className={cn('relative inline-flex items-center', className)}>
      {state === 'listening' && (
        <>
          <span className="pointer-events-none absolute inset-0 rounded-full bg-accent-400/30 animate-orb-ring" aria-hidden="true" />
          <span
            className="pointer-events-none absolute inset-0 rounded-full bg-accent-400/20 animate-orb-ring"
            style={{ animationDelay: '0.6s' }}
            aria-hidden="true"
          />
        </>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={labels[state]}
        aria-pressed={state === 'listening'}
        title={labels[state]}
        className={cn(
          'relative grid place-items-center rounded-full transition-all duration-200',
          dims,
          state === 'listening'
            ? 'bg-accent-500 text-brand-950 shadow-3 hover:bg-accent-400'
            : state === 'error'
              ? 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100'
              : state === 'unsupported'
                ? 'cursor-not-allowed bg-ink-100 text-ink-400'
                : 'bg-white text-brand-900 ring-1 ring-ink-300 shadow-1 hover:bg-brand-50 hover:ring-brand-300',
        )}
      >
        {state === 'listening' ? (
          <Square className="size-3.5 fill-current" aria-hidden="true" />
        ) : state === 'processing' ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : state === 'unsupported' ? (
          <MicOff className="size-4" aria-hidden="true" />
        ) : state === 'error' ? (
          <AlertCircle className="size-4" aria-hidden="true" />
        ) : (
          <Mic className={size === 'lg' ? 'size-5' : 'size-4'} aria-hidden="true" />
        )}
      </button>

      {language && state === 'listening' && (
        <span className="ms-2 rounded-md bg-accent-100 px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wider text-accent-700">
          {language}
        </span>
      )}
    </span>
  );
}

/** Animated waveform used while Sahara is speaking or listening. */
export function Waveform({
  active,
  bars = 5,
  className,
}: {
  active: boolean;
  bars?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-end gap-[3px]', className)} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn('w-[3px] rounded-full bg-current transition-all', active ? 'animate-pulse-soft' : 'opacity-40')}
          style={{
            height: active ? `${6 + ((i * 5) % 12)}px` : '4px',
            animationDelay: `${i * 0.12}s`,
            animationDuration: '0.9s',
          }}
        />
      ))}
    </span>
  );
}
