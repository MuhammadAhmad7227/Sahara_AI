/**
 * i18n registry.
 *
 * Only English is typed as the full dictionary; the others are Partial and fall
 * back to English per key. This means a page that is not yet translated still
 * renders readable English rather than blank space or a dotted key — and the
 * Language menu says so, instead of pretending the translation is complete.
 */
import { en, TERMINOLOGY, type Dictionary, type TranslationKey } from '@/i18n/en';
import { ur } from '@/i18n/ur';
import { pa } from '@/i18n/pa';
import type { Language } from '@/types/domain';

export type { Dictionary, TranslationKey };
export { TERMINOLOGY };
export { en, ur, pa };

export const dictionaries: Record<Language, Partial<Record<TranslationKey, string>>> = {
  en,
  ur,
  pa,
};

/**
 * Per-language presentation metadata.
 *
 * `dir` describes the DIRECTION OF THE TEXT, not the direction of the layout.
 * Shahmukhi Punjabi and Urdu are written right-to-left, so their text runs carry
 * `dir="rtl"` locally (see TextRun in LanguageContext). The document itself is
 * always LTR, so the navbar, cards, sidebar and controls never mirror.
 */
export const languageMeta: Record<
  Language,
  {
    label: string;
    native: string;
    /** Direction of the written script. Applied to text runs only. */
    dir: 'ltr' | 'rtl';
    /** BCP-47 locale used for dates, numbers and speech synthesis. */
    locale: string;
    /** Speech-recognition locale; falls back to the language tag if unsupported. */
    speechLocale: string;
    /** CSS font-family token used for running text in this language. */
    font: string;
    note: string;
  }
> = {
  en: {
    label: 'English',
    native: 'English',
    dir: 'ltr',
    locale: 'en-GB',
    speechLocale: 'en-PK',
    font: 'var(--font-sans)',
    note: 'Full interface',
  },
  ur: {
    label: 'Urdu',
    native: 'اردو',
    dir: 'rtl',
    locale: 'ur-PK',
    speechLocale: 'ur-PK',
    font: 'var(--font-arabic-body)',
    note: 'Right-to-left text, left-to-right layout',
  },
  pa: {
    label: 'Punjabi',
    // Shahmukhi, matching the script the Punjabi strings are actually written in.
    native: 'پنجابی',
    dir: 'rtl',
    locale: 'pa-PK',
    speechLocale: 'pa-PK',
    font: 'var(--font-arabic-body)',
    note: 'Shahmukhi script, right-to-left text',
  },
};

export const supportedLanguages: Language[] = ['en', 'ur', 'pa'];

/**
 * Locales actually offered by the Web Speech API are not guaranteed. We declare
 * which recognition locales we *attempt*, and the UI reports the browser's real
 * answer at runtime (`SpeechRecognition` availability + error events). We never
 * claim support we have not observed.
 */
export const speechRecognitionLocale: Record<Language, string> = {
  en: 'en-PK',
  ur: 'ur-PK',
  pa: 'pa-PK',
};
