import { useEffect, useState } from 'react';
import { Headphones, Pause, Play, Square } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { languageMeta } from '@/i18n';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

/** Opt-in reading of the current visible page or a user-selected passage. */
export function PageReader() {
  const { language, t } = useLanguage();
  const location = useLocation();
  const { supported, state, hasVoiceFor, speak, stop, pause, resume } = useSpeechSynthesis();
  const [notice, setNotice] = useState('');
  const ready = supported && hasVoiceFor(language);

  useEffect(() => {
    stop();
    setNotice('');
  }, [location.pathname, location.search, language, stop]);

  const read = (selectionOnly: boolean) => {
    const main = document.getElementById('main-content');
    const selection = window.getSelection();
    const selected = selection && main?.contains(selection.anchorNode) && main.contains(selection.focusNode)
      ? selection.toString().trim() : '';
    const text = selectionOnly ? selected : (main?.innerText ?? '').trim();
    if (!text) {
      setNotice(t(selectionOnly ? 'reader.noSelection' : 'reader.noText'));
      return;
    }
    setNotice('');
    speak(text, language);
  };

  return (
    <div className="container-page pt-3">
      <details className="rounded-xl border border-brand-900/10 bg-white/80 px-3 py-2 shadow-1">
        <summary className="flex min-h-9 cursor-pointer items-center gap-2 text-sm font-semibold text-brand-900">
          <Headphones className="size-4" aria-hidden="true" /> <span dir="auto">{t('reader.title')}</span>
        </summary>
        <p dir="auto" className="max-w-3xl pt-1 text-xs leading-relaxed text-ink-600">{t('reader.help')}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" disabled={!ready} onClick={() => read(false)} className="min-h-11 rounded-lg bg-brand-900 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{t('reader.page')}</button>
          <button type="button" disabled={!ready} onPointerDown={(event) => event.preventDefault()} onClick={() => read(true)} className="min-h-11 rounded-lg border border-ink-200 bg-white px-3 text-sm font-medium text-ink-800 disabled:cursor-not-allowed disabled:opacity-50">{t('reader.selection')}</button>
          {(state === 'speaking' || state === 'paused') && <>
            <button type="button" onClick={state === 'speaking' ? pause : resume} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-sm text-ink-800">
              {state === 'speaking' ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {t(state === 'speaking' ? 'reader.pause' : 'reader.resume')}
            </button>
            <button type="button" onClick={stop} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-ink-200 px-3 text-sm text-ink-800"><Square className="size-4" aria-hidden="true" />{t('reader.stop')}</button>
          </>}
        </div>
        {(!ready || notice || state === 'error') && <p role="status" dir="auto" className="mt-2 text-xs leading-relaxed text-amber-800">{!ready ? t('reader.unavailable', { language: languageMeta[language].native }) : notice || t('reader.error')}</p>}
      </details>
    </div>
  );
}
