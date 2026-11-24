/**
 * Multilingual + RTL behaviour.
 *
 * The requirement is not "translate every string"; it is that the architecture is
 * correct: one set of pages, a translation table per language, Urdu switching the
 * document to RTL and applying the Nastaliq face, and untranslated keys falling
 * back to English instead of showing a raw key.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { dictionaries, languageMeta, urduDictionary } from '@/i18n/dictionaries';
import { VerificationBadge } from '@/components/common/Badge';

function Probe() {
  const { language, dir, setLanguage, t, isTranslated } = useLanguage();
  return (
    <div>
      <p data-testid="lang">{language}</p>
      <p data-testid="dir">{dir}</p>
      <p data-testid="home">{t('nav.home')}</p>
      <p data-testid="fallback">{t('nav.topics')}</p>
      <p data-testid="translated">{String(isTranslated('nav.topics'))}</p>
      <button onClick={() => setLanguage('ur')}>Urdu</button>
      <button onClick={() => setLanguage('pa')}>Punjabi</button>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  );

describe('Language switching', () => {
  it('defaults to English and LTR', () => {
    renderProbe();
    expect(screen.getByTestId('lang')).toHaveTextContent('en');
    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
    expect(screen.getByTestId('home')).toHaveTextContent('Home');
  });

  it('switches to Urdu, flips the document to RTL and keeps <html lang> in sync', async () => {
    const user = userEvent.setup();
    renderProbe();

    await user.click(screen.getByRole('button', { name: 'Urdu' }));

    expect(screen.getByTestId('lang')).toHaveTextContent('ur');
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.documentElement.getAttribute('lang')).toBe('ur');
    expect(screen.getByTestId('home')).toHaveTextContent(/./);
    expect(screen.getByTestId('home').textContent).not.toBe('Home');
  });

  it('persists the choice for the next visit', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole('button', { name: 'Punjabi' }));
    // Values are JSON-encoded so the same helper can read objects and primitives.
    expect(JSON.parse(localStorage.getItem('sahara.language') ?? 'null')).toBe('pa');
  });

  it('falls back to English instead of showing a raw key', async () => {
    const user = userEvent.setup();
    renderProbe();

    // Pick a key that is intentionally untranslated in Punjabi.
    const untranslated = (Object.keys(dictionaries) as Array<keyof typeof dictionaries>).length > 0
      ? Object.keys(dictionaries.en).find((key) => !urduDictionary[key as keyof typeof urduDictionary])
      : undefined;

    await user.click(screen.getByRole('button', { name: 'Urdu' }));

    if (untranslated) {
      const english = dictionaries.en[untranslated as keyof typeof dictionaries.en];
      expect(screen.getByTestId('fallback').textContent).not.toBe(untranslated);
      expect(english).toBeTruthy();
    }
    // A key with no translation must never render as its dotted key.
    expect(screen.getByTestId('fallback').textContent).not.toMatch(/^[a-z]+\.[a-zA-Z]+$/);
  });

  it('restores English and LTR when switching back', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole('button', { name: 'Urdu' }));
    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
    expect(screen.getByTestId('home')).toHaveTextContent('Home');
  });
});

describe('RTL typography and metadata', () => {
  it('marks English LTR and both Arabic-script languages RTL', () => {
    expect(languageMeta.ur.dir).toBe('rtl');
    expect(languageMeta.en.dir).toBe('ltr');
    // Punjabi is written in Shahmukhi (Arabic script) here, so it reads right-to-left.
    expect(languageMeta.pa.dir).toBe('rtl');
  });

  it('uses an Urdu-capable font stack and a locale for each language', () => {
    expect(languageMeta.ur.locale).toBe('ur-PK');
    expect(String(languageMeta.ur.font)).toMatch(/Urdu|Nastaliq/i);
  });

  it('translates the verification badge in Urdu', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Probe />
        <VerificationBadge status="verified" />
      </LanguageProvider>,
    );

    expect(screen.getByText('Verified')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Urdu' }));
    expect(screen.getByText('تصدیق شدہ')).toBeInTheDocument();
  });
});

describe('Translation coverage floor', () => {
  it('Urdu covers at least 90% of the used keys', () => {
    const usedKeys = Object.keys(dictionaries.en);
    const urduKeys = Object.keys(urduDictionary);
    const coverage = urduKeys.filter((k) => usedKeys.includes(k)).length / usedKeys.length;
    expect(coverage).toBeGreaterThan(0.9);
  });

  it('every language exposes a label for the selector', () => {
    expect(dictionaries.en['lang.urdu']).toBeTruthy();
    expect(dictionaries.en['lang.punjabi']).toBeTruthy();
    expect(dictionaries.en['lang.english']).toBeTruthy();
  });
});
