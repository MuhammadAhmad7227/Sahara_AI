/**
 * useSpeechSynthesis — "Listen" playback for assistant answers.
 *
 * Behaviour guaranteed here:
 *  - The utterance language follows the SELECTED language, not the UI default.
 *  - A voice is chosen whose locale actually matches the language. If none is
 *    installed, we report `available: false` for that language rather than
 *    reading Urdu with an English voice (which would be worse than silence).
 *  - Full state machine: idle → speaking → paused → speaking → idle, with error.
 *  - Cancels on unmount, navigates away, or when a new utterance starts.
 *
 * Provider seam: everything browser-specific is confined to this hook. Swapping
 * in a backend TTS service means reimplementing `speak()` against an audio URL
 * and keeping the same returned state — no page changes.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '@/types/domain';

export type SpeechState = 'idle' | 'speaking' | 'paused' | 'error';

/** Minimal structural types so we do not depend on lib.dom SpeechSynthesis types. */
interface VoiceLike {
  lang: string;
  name: string;
  localService: boolean;
  default: boolean;
}
interface UtteranceLike {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  voice: VoiceLike | null;
  text: string;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onpause: (() => void) | null;
  onresume: (() => void) | null;
}
type UtteranceCtor = new (text: string) => UtteranceLike;

const LANGUAGE_TAG: Record<Language, string> = {
  en: 'en-PK',
  ur: 'ur-PK',
  pa: 'pa-PK',
};

/** Looser tags browsers actually ship, in preference order. */
const FALLBACK_TAGS: Record<Language, string[]> = {
  en: ['en-PK', 'en-GB', 'en-IN', 'en-US', 'en'],
  ur: ['ur-PK', 'ur-IN', 'ur'],
  pa: ['pa-PK', 'pa-IN', 'pa-Guru-IN', 'pa', 'pnb'],
};

function getSupport() {
  if (typeof window === 'undefined') return { supported: false, ctor: null as UtteranceCtor | null };
  const synth = 'speechSynthesis' in window;
  const ctor = (window as unknown as { SpeechSynthesisUtterance?: UtteranceCtor })
    .SpeechSynthesisUtterance;
  return { supported: synth && Boolean(ctor), ctor: ctor ?? null };
}

/** Find an installed voice that genuinely matches the language. */
function pickVoice(voices: VoiceLike[], lang: Language): VoiceLike | null {
  const candidates = FALLBACK_TAGS[lang].map((t) => t.toLowerCase());

  const exact = voices.filter((v) => candidates.includes(v.lang.toLowerCase().replace('_', '-')));
  if (exact.length > 0) {
    // Prefer a local, non-default voice: platform "default" voices are often the
    // English one aliased to every language tag on Android.
    const local = exact.find((v) => v.localService && !v.default);
    return local ?? exact[0] ?? null;
  }

  // Match on primary subtag (e.g. "ur" from "ur-PK") as a last resort.
  const primary = candidates[0]?.split('-')[0];
  const loose = voices.find((v) => v.lang.toLowerCase().startsWith(`${primary}-`) || v.lang.toLowerCase() === primary);
  return loose ?? null;
}

export function useSpeechSynthesis() {
  const [state, setState] = useState<SpeechState>('idle');
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<VoiceLike[]>([]);
  const utteranceRef = useRef<UtteranceLike | null>(null);
  const ctorRef = useRef<UtteranceCtor | null>(null);
  const keepAliveRef = useRef<number | null>(null);

  useEffect(() => {
    const { supported: isSupported, ctor } = getSupport();
    setSupported(isSupported);
    ctorRef.current = ctor;
    if (!isSupported) return;

    const load = () => setVoices(window.speechSynthesis.getVoices() as unknown as VoiceLike[]);
    load();
    // Chrome populates voices asynchronously and fires this event.
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      if (keepAliveRef.current !== null) {
        window.clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      if (utteranceRef.current) {
        utteranceRef.current = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /** Is there a usable voice for this language on this device? */
  const hasVoiceFor = useCallback(
    (lang: Language) => supported && pickVoice(voices, lang) !== null,
    [supported, voices],
  );

  const stop = useCallback(() => {
    if (!supported) return;
    if (keepAliveRef.current !== null) {
      window.clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    const owned = utteranceRef.current !== null;
    utteranceRef.current = null;
    if (owned) window.speechSynthesis.cancel();
    setState('idle');
  }, [supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setState('paused');
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setState('speaking');
  }, [supported]);

  const speak = useCallback(
    (text: string, lang: Language) => {
      if (!supported || !ctorRef.current) {
        setState('error');
        return;
      }
      // Always cancel first: two overlapping utterances is the classic bug.
      if (keepAliveRef.current !== null) {
        window.clearInterval(keepAliveRef.current);
        keepAliveRef.current = null;
      }
      utteranceRef.current = null;
      window.speechSynthesis.cancel();

      const voice = pickVoice(voices, lang);
      if (!voice) {
        // No matching voice installed — report honestly instead of mis-pronouncing.
        setState('error');
        return;
      }

      const utterance = new ctorRef.current(text);
      utterance.lang = voice.lang || LANGUAGE_TAG[lang];
      utterance.voice = voice;
      utterance.rate = lang === 'en' ? 1 : 0.92; // Arabic-script voices run fast at 1.0
      utterance.pitch = 1;
      utterance.volume = 1;

      const clearKeepAlive = () => {
        if (keepAliveRef.current !== null) {
          window.clearInterval(keepAliveRef.current);
          keepAliveRef.current = null;
        }
      };

      utterance.onend = () => {
        if (utteranceRef.current !== utterance) return;
        clearKeepAlive();
        utteranceRef.current = null;
        setState('idle');
      };
      utterance.onerror = () => {
        if (utteranceRef.current !== utterance) return;
        clearKeepAlive();
        utteranceRef.current = null;
        setState('error');
      };
      utterance.onpause = () => { if (utteranceRef.current === utterance) setState('paused'); };
      utterance.onresume = () => { if (utteranceRef.current === utterance) setState('speaking'); };

      utteranceRef.current = utterance;
      setState('speaking');
      // Structural type is narrower than lib.dom's SpeechSynthesisUtterance;
      // the object is a real utterance at runtime.
      window.speechSynthesis.speak(utterance as unknown as SpeechSynthesisUtterance);

      /*
       * Chrome stops speaking after roughly 15 seconds of a single utterance
       * unless it is nudged. Assistant answers are long, so a describe-timer
       * keeps it alive; `resume()` on an already-speaking engine is a no-op.
       * Cleared on end/error/unmount so it cannot leak.
       */
      const keepAlive = window.setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          window.clearInterval(keepAlive);
          return;
        }
        if (!window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10_000);
      keepAliveRef.current = keepAlive;
    },
    [supported, voices],
  );

  const toggle = useCallback(
    (text: string, lang: Language) => {
      if (state === 'speaking') {
        pause();
      } else if (state === 'paused') {
        resume();
      } else {
        speak(text, lang);
      }
    },
    [state, pause, resume, speak],
  );

  return { supported, state, speak, pause, resume, stop, toggle, hasVoiceFor, voices };
}
