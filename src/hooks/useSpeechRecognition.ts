/**
 * Browser speech recognition with a visible transcript and graceful degradation.
 * The proposal treats voice as an input channel over the same text pipeline, so
 * this hook only fills the text box — the user reviews and submits it.
 *
 * If the browser has no SpeechRecognition, `supported` is false and the UI shows
 * a text fallback instead of a dead microphone button.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
  length: number;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionErrorLike {
  error: string;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Language handling.
 *
 * `language` is the BCP-47 locale to attempt (ur-PK, pa-PK, en-PK). Browsers do
 * not all ship models for every locale, and there is no API that reports which
 * locales are supported. So we do not claim Punjabi support up front: we attempt
 * the locale and, if the engine fires `language-not-supported` (Chrome) or
 * `not-allowed`/`service-not-allowed`, we surface a precise, honest message and
 * tell the user to type instead. `unsupportedLanguage` records that outcome so
 * the UI can stop offering a mic that will not work.
 */
export function useSpeechRecognition({
  language,
  onResult,
}: {
  language: string;
  onResult: (transcript: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Set when the engine reports it has no model for the requested locale. */
  const [unsupportedLanguage, setUnsupportedLanguage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const supported = getCtor() !== null;

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) {
      setError('This browser does not support speech input.');
      return;
    }

    setError(null);
    const recognition = new Ctor();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result?.isFinal && result[0]) transcript += result[0].transcript;
      }
      if (transcript.trim()) onResultRef.current(transcript.trim());
    };

    recognition.onerror = (event) => {
      const messages: Record<string, string> = {
        'not-allowed': 'Microphone permission was blocked.',
        'service-not-allowed': 'Speech recognition is not available on this connection.',
        'no-speech': 'No speech was detected.',
        'language-not-supported': 'This browser has no speech model for the selected language.',
        network: 'The speech service could not be reached.',
      };

      // A missing model is a permanent condition for this locale, not a transient
      // failure, so remember it and stop offering the microphone.
      if (event.error === 'language-not-supported') {
        setUnsupportedLanguage(language);
      }

      setError(messages[event.error] ?? 'Speech recognition stopped unexpectedly.');
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('Speech recognition could not start. Please type your question.');
      setListening(false);
    }
  }, [language]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return {
    supported,
    /** True only when the engine has explicitly rejected this locale. */
    languageUnsupported: unsupportedLanguage === language,
    listening,
    error,
    start,
    stop,
    clearError: () => setError(null),
  };
}
