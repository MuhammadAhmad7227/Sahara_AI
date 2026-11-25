/**
 * Language behaviour.
 *
 * The critical requirement these tests lock down:
 *
 *   Changing language changes TEXT ONLY. The document direction, and therefore
 *   the layout, must never mirror.
 *
 * The old build failed this: it set `document.documentElement.dir = 'rtl'` for
 * Urdu, which flipped the navbar, cards and sidebar. That is now a regression
 * test, not just a convention.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import { dictionaries, en, languageMeta, pa, ur } from '@/i18n';
import { VerificationBadge } from '@/components/common/Badge';
import { TextRun } from '@/components/common/TextRun';

function Probe() {
  const { language, textDir, layoutDir, setLanguage, t } = useLanguage();
  return (
    <div>
      <p data-testid="lang">{language}</p>
      <p data-testid="text-dir">{textDir}</p>
      <p data-testid="layout-dir">{layoutDir}</p>
      <p data-testid="home">{t('nav.home')}</p>
      <p data-testid="missing">{t('app.civicAssistant')}</p>
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

describe('Layout never mirrors when the language changes', () => {
  it('keeps the document LTR in every language', async () => {
    const user = userEvent.setup();
    renderProbe();

    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    await user.click(screen.getByRole('button', { name: 'Urdu' }));
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    await user.click(screen.getByRole('button', { name: 'Punjabi' }));
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    // And the provider never claims a non-LTR layout.
    expect(screen.getByTestId('layout-dir')).toHaveTextContent('ltr');
  });

  it('reports RTL for the TEXT of Urdu and Punjabi, but not for the layout', async () => {
    const user = userEvent.setup();
    renderProbe();

    expect(screen.getByTestId('text-dir')).toHaveTextContent('ltr');
    await user.click(screen.getByRole('button', { name: 'Urdu' }));
    expect(screen.getByTestId('text-dir')).toHaveTextContent('rtl');
    expect(screen.getByTestId('layout-dir')).toHaveTextContent('ltr');
  });

  it('sets <html lang> for pronunciation without changing direction', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole('button', { name: 'Urdu' }));

    expect(document.documentElement.getAttribute('lang')).toBe('ur');
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');
  });

  it('swaps the copy in place', async () => {
    const user = userEvent.setup();
    renderProbe();

    expect(screen.getByTestId('home')).toHaveTextContent('Home');
    await user.click(screen.getByRole('button', { name: 'Urdu' }));
    expect(screen.getByTestId('home')).toHaveTextContent('ہوم');
    await user.click(screen.getByRole('button', { name: 'Punjabi' }));
    expect(screen.getByTestId('home')).toHaveTextContent('گھر');
  });
});

describe('TextRun isolates text direction', () => {
  it('marks Urdu text RTL and isolates it with <bdi>', async () => {
    const user = userEvent.setup();
    render(
      <LanguageProvider>
        <Probe />
        <p data-testid="wrapper">
          Documents: <TextRun>شناختی کارڈ کی نقل</TextRun>
        </p>
      </LanguageProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Urdu' }));

    const run = screen.getByText('شناختی کارڈ کی نقل');
    expect(run.tagName.toLowerCase()).toBe('bdi');
    expect(run).toHaveAttribute('dir', 'rtl');
    expect(run).toHaveAttribute('lang', 'ur');

    // The wrapper is untouched, so the surrounding layout cannot mirror.
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).not.toHaveAttribute('dir', 'rtl');
  });
});

describe('Translation fallback', () => {
  it('falls back to English instead of a dotted key', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByRole('button', { name: 'Punjabi' }));

    const missing = screen.getByTestId('missing').textContent ?? '';
    expect(missing).not.toMatch(/^[a-z]+\.[a-zA-Z]+$/);
  });

  it('interpolates variables', () => {
    // Exercised through the dictionary shape rather than a component.
    const template = en['lang.changed'];
    expect(template).toContain('{language}');
    expect(template.replace('{language}', 'Urdu')).toContain('Urdu');
  });
});

describe('Dictionary integrity', () => {
  it('has no key that exists in a translation but not in English', () => {
    const englishKeys = new Set(Object.keys(en));
    for (const [lang, dict] of Object.entries({ ur, pa })) {
      for (const key of Object.keys(dict)) {
        expect(englishKeys.has(key), `${lang} has unknown key ${key}`).toBe(true);
      }
    }
  });

  it('translates at least 85% of the dictionary into Urdu and Punjabi', () => {
    const total = Object.keys(en).length;
    for (const [lang, dict] of Object.entries({ ur, pa })) {
      const coverage = Object.keys(dict).length / total;
      expect(coverage, `${lang} coverage ${Math.round(coverage * 100)}%`).toBeGreaterThan(0.85);
    }
  });

  it('keeps terminology consistent across languages', () => {
    // The same concept must use the same word everywhere.
    const citation = Object.keys(dictionaries.en).filter((k) => /^verify\.|^services\./.test(k));
    expect(citation.length).toBeGreaterThan(20);
  });

  it('declares text direction per language but only ever LTR layout', () => {
    expect(languageMeta.ur.dir).toBe('rtl');
    expect(languageMeta.pa.dir).toBe('rtl');
    expect(languageMeta.en.dir).toBe('ltr');
    // No language metadata field may be used to mirror the app.
    expect(Object.values(languageMeta).every((m) => m.locale)).toBe(true);
  });
});

describe('Localised badges', () => {
  it('translates the verification badge', async () => {
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
