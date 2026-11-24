/**
 * Language + direction provider.
 * Sets <html lang> and <html dir> so that RTL layout, Urdu typography and
 * screen-reader pronunciation follow the selected language everywhere.
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
import { dictionaries, languageMeta, type TranslationKey } from '@/i18n/dictionaries';
import type { Language } from '@/types/domain';
import { storage } from '@/utils/cn';

interface LanguageContextValue {
  language: Language;
  dir: 'ltr' | 'rtl';
  locale: string;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** True when the key had no translation and fell back to English. */
  isTranslated: (key: TranslationKey) => boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'sahara.language';
const SUPPORTED: Language[] = ['en', 'ur', 'pa'];

function initialLanguage(): Language {
  const stored = storage.get<string | null>(STORAGE_KEY, null);
  if (stored && SUPPORTED.includes(stored as Language)) return stored as Language;
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language.toLowerCase();
    if (nav.startsWith('ur')) return 'ur';
    if (nav.startsWith('pa')) return 'pa';
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const dir = languageMeta[language].dir;
  const locale = languageMeta[language].locale;

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = dir;
    storage.set(STORAGE_KEY, language);
  }, [language, dir]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const table = dictionaries[language] ?? dictionaries.en;
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
    () => ({ language, dir, locale, setLanguage, t, isTranslated }),
    [language, dir, locale, setLanguage, t, isTranslated],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
