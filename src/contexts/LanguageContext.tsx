/**
 * Language + text-direction provider.
 *
 * DESIGN RULE (the reason this file changed):
 * --------------------------------------------------------------
 * Changing language must change TEXT ONLY. It must never mirror the interface.
 *
 * So this provider:
 *   - never touches `document.documentElement.dir` (it stays 'ltr' forever);
 *   - writes `lang` on <html> only for pronunciation and hyphenation;
 *   - exposes `textDir` so individual text runs can be right-to-left;
 *   - sets a data attribute so CSS can apply the correct font per language
 *     without switching layout direction.
 *
 * The result: English, Urdu and Punjabi render in an identical visual structure —
 * same navbar position, same card order, same button placement — while the words
 * and the glyph shaping are correct.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  dictionaries,
  languageMeta,
  supportedLanguages,
  type TranslationKey,
} from '@/i18n';
import type { Language } from '@/types/domain';
import { storage } from '@/utils/cn';

interface LanguageContextValue {
  language: Language;
  /** Direction of TEXT in the current language. Not the layout direction. */
  textDir: 'ltr' | 'rtl';
  /** The application layout direction. Always 'ltr', by design. */
  layoutDir: 'ltr';
  locale: string;
  speechLocale: string;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** True when the current language genuinely has this key translated. */
  isTranslated: (key: TranslationKey) => boolean;
  /** Percentage of English keys translated into the current language. */
  coverage: number;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'sahara.language';

function initialLanguage(): Language {
  const stored = storage.get<string | null>(STORAGE_KEY, null);
  if (stored && supportedLanguages.includes(stored as Language)) return stored as Language;
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('ur')) return 'ur';
    if (nav.startsWith('pa')) return 'pa';
  }
  return 'en';
}

/** Epoch counter used to derive coverage once per dictionary, cheaply. */
function computeCoverage(lang: Language): number {
  const total = Object.keys(dictionaries.en).length;
  const translated = Object.keys(dictionaries[lang] ?? {}).length;
  return Math.round((translated / total) * 100);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const meta = languageMeta[language];
  const textDir = meta.dir;

  useEffect(() => {
    const root = document.documentElement;

    // Language tag drives pronunciation, hyphenation and font-feature settings.
    root.lang = language;

    // Direction is intentionally NOT set here. It is written once, below, to
    // make the intent explicit and to correct any persisted value from an older
    // build of the app.
    root.dir = 'ltr';
    root.dataset.lang = language;

    storage.set(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const table = dictionaries[language];
      const raw = table[key] ?? dictionaries.en[key] ?? key;
      if (!vars) return raw;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
        raw,
      );
    },
    [language],
  );

  const isTranslated = useCallback(
    (key: TranslationKey) => Boolean(dictionaries[language]?.[key]),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      textDir,
      layoutDir: 'ltr',
      locale: meta.locale,
      speechLocale: meta.speechLocale,
      setLanguage,
      t,
      isTranslated,
      coverage: computeCoverage(language),
    }),
    [language, textDir, meta.locale, meta.speechLocale, setLanguage, t, isTranslated],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
