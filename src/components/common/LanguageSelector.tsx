/**
 * Language selector.
 *
 * Two behaviours matter here:
 *  1. The menu lists each language in its OWN script, wrapped in <bdi> so the
 *     native name renders correctly inside the left-to-right menu.
 *  2. It explains that some content remains untranslated, without treating
 *     dictionary-key coverage as coverage of the entire interface.
 */
import { useEffect, useId, useRef, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languageMeta, supportedLanguages } from '@/i18n';
import { cn } from '@/utils/cn';
import type { Language } from '@/types/domain';

/** Select-styled switcher used in forms and settings. */
export function LanguageSelector({
  value,
  onChange,
  label,
  id,
  className,
}: {
  value: Language;
  onChange: (lang: Language) => void;
  label?: string;
  id?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={selectId} className="block text-sm font-medium text-ink-800">
        {label ?? t('lang.interface')}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="h-11 w-full rounded-lg border border-brand-900/15 bg-white px-3 text-[0.9375rem] text-ink-900 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {languageMeta[lang].native} ({languageMeta[lang].label})
          </option>
        ))}
      </select>
      <p className="text-xs text-ink-500">{t('lang.interfaceNote')}</p>
    </div>
  );
}

/** Compact dropdown used in the header. */
export function LanguageMenu({ compact, placement = 'bottom', align = 'end' }: { compact?: boolean; placement?: 'top' | 'bottom'; align?: 'start' | 'end' }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    containerRef.current?.querySelector<HTMLButtonElement>('[role="menuitemradio"][aria-checked="true"]')?.focus();
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
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
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t('lang.label')}: ${languageMeta[language].native}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink-800 transition-colors hover:bg-ink-900/[0.05] dark:text-sand-100"
      >
        <Globe className="size-4" aria-hidden="true" />
        {compact ? (
          <span className="text-xs font-semibold uppercase">{language}</span>
        ) : (
          <bdi dir={languageMeta[language].dir} className="font-arabic-body">
            {languageMeta[language].native}
          </bdi>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('lang.interface')}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              triggerRef.current?.focus();
              return;
            }
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
            if (!items.length) return;
            event.preventDefault();
            const current = items.indexOf(document.activeElement as HTMLButtonElement);
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 :
              event.key === 'ArrowDown' ? (current + 1) % items.length : (current <= 0 ? items.length - 1 : current - 1);
            items[next]?.focus();
          }}
          className={cn('absolute z-50 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-ink-200 bg-paper p-1.5 shadow-3 animate-slide-up', placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5', align === 'start' ? 'start-0' : 'end-0')}
        >
          <p className="px-2 pb-1 pt-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-400">
            {t('lang.interface')}
          </p>

          {supportedLanguages.map((lang) => {
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
                  triggerRef.current?.focus();
                }}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-start transition-colors',
                  selected ? 'bg-brand-50 text-brand-900' : 'text-ink-700 hover:bg-ink-100',
                )}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5">
                    {/* Native script, isolated with its own direction so it
                        cannot reorder the surrounding LTR menu row. */}
                    <bdi dir={languageMeta[lang].dir} lang={lang} className="text-sm font-semibold">
                      {languageMeta[lang].native}
                    </bdi>
                    <span className="text-[0.6875rem] font-normal text-ink-400">
                      {languageMeta[lang].label}
                    </span>
                  </span>
                </span>
                {selected && <Check className="size-4 shrink-0 text-brand-800" aria-hidden="true" />}
              </button>
            );
          })}

          <p className="mt-1 border-t border-ink-100 px-2 pb-1 pt-2 text-[0.6875rem] leading-relaxed text-ink-500">
            {t('lang.partialNote')}
          </p>
        </div>
      )}
    </div>
  );
}
