import { useEffect, useId, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languageMeta } from '@/i18n/dictionaries';
import { cn } from '@/utils/cn';
import type { Language } from '@/types/domain';

const options: Language[] = ['en', 'ur', 'pa'];

/** Select-styled language switcher (used in forms and filters). */
export function LanguageSelector({
  value,
  onChange,
  label = 'Language',
  id,
  className,
}: {
  value: Language;
  onChange: (lang: Language) => void;
  label?: string;
  id?: string;
  className?: string;
}) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={selectId} className="block text-sm font-medium text-ink-800">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="h-11 w-full rounded-lg border border-ink-300 bg-white px-3 text-[0.9375rem] text-ink-900 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        {options.map((lang) => (
          <option key={lang} value={lang}>
            {languageMeta[lang].native} ({languageMeta[lang].label})
          </option>
        ))}
      </select>
    </div>
  );
}

/** Compact dropdown used in the header. */
export function LanguageMenu({ compact }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('lang.label')}: ${languageMeta[language].native}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
      >
        <Globe className="size-4" aria-hidden="true" />
        {compact ? (
          <span className="text-xs font-semibold uppercase">{language}</span>
        ) : (
          <span>{languageMeta[language].native}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('lang.interface')}
          className="absolute end-0 z-50 mt-1.5 w-56 rounded-xl border border-ink-200 bg-white p-1.5 shadow-overlay animate-slide-up"
        >
          <p className="px-2 pb-1 pt-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
            {t('lang.interface')}
          </p>
          {options.map((lang) => {
            const selected = lang === language;
            return (
              <button
                key={lang}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setLanguage(lang);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start text-sm',
                  selected ? 'bg-brand-50 text-brand-900' : 'text-ink-700 hover:bg-ink-100',
                )}
              >
                <span className="flex flex-col">
                  <span className={cn('font-medium', lang === 'ur' && 'font-urdu text-base')}>
                    {languageMeta[lang].native}
                  </span>
                  <span className="text-xs text-ink-500">
                    {languageMeta[lang].label}
                    {lang !== 'en' && <span className="ms-1 text-ink-400">· {languageMeta[lang].dir.toUpperCase()}</span>}
                  </span>
                </span>
                {selected && <Check className="size-4 shrink-0 text-brand-800" aria-hidden="true" />}
              </button>
            );
          })}
          <p className="mt-1 border-t border-ink-100 px-2 pb-1 pt-2 text-[0.6875rem] leading-relaxed text-ink-500">
            {language === 'en' ? 'Urdu and Punjabi are displayed right-to-left.' : t('lang.partialNote')}
          </p>
        </div>
      )}
    </div>
  );
}
