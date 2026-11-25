/**
 * Layout parity — the executable stand-in for the screenshot comparison.
 *
 * The brief asked for screenshots of Home in EN / UR / PA. A browser cannot be
 * installed in this environment, so this test does the next best thing and
 * checks the thing a screenshot would reveal: that the DOM *structure* of the
 * page is identical in all three languages, and that only text differs.
 *
 * Concretely it asserts, per language:
 *   - the same tag sequence (so no extra wrapper appeared and nothing reordered);
 *   - elements are in the same document order (so nav cannot mirror);
 *   - the container classes are byte-identical (so no flex/grid direction flip);
 *   - <html> is LTR while the *text runs* carry the RTL direction;
 *   - the page is not empty, i.e. the translation actually rendered.
 *
 * This is deliberately a structural test, not a pixel test. It cannot catch a
 * font that is 2px too tall; it can catch a mirrored layout, which was the bug.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/common/Feedback';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HomePage from '@/pages/public/HomePage';
import type { Language } from '@/types/domain';
import { supportedLanguages } from '@/i18n';

function renderChrome(language: Language) {
  // `storage` JSON-encodes values, so seed it the same way the app writes it.
  window.localStorage.setItem('sahara.language', JSON.stringify(language));
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main>
              <HomePage />
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </MemoryRouter>,
  );
}

/** Tag sequence of the rendered tree, ignoring text nodes entirely. */
function tagSignature(root: HTMLElement): string {
  return Array.from(root.querySelectorAll('*'))
    .map((el) => el.tagName.toLowerCase())
    .join('>');
}

/** All class attributes in document order. */
function classSignature(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('*')).map((el) => el.getAttribute('class') ?? '');
}

let baseline: { tags: string; classes: string[] } | null = null;

describe('Home page renders the same structure in every language', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('dir');
    document.documentElement.removeAttribute('lang');
  });

  for (const language of supportedLanguages) {
    it(`${language}: keeps document order, classes and LTR layout`, () => {
      const { container, unmount } = renderChrome(language);
      expect(container.textContent?.trim().length ?? 0).toBeGreaterThan(200);

      const tags = tagSignature(container);
      const classes = classSignature(container);

      if (!baseline) {
        baseline = { tags, classes };
      } else {
        // Same elements, same order, same styling hooks — for every language.
        expect(tags, 'tag sequence must be identical across languages').toBe(baseline.tags);
        expect(classes, 'class attributes must be identical across languages').toEqual(
          baseline.classes,
        );
      }

      // The layout direction never follows the language.
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      // But the language is declared, so the correct font is applied.
      expect(document.documentElement.getAttribute('lang')).toBe(language);

      unmount();
    });
  }

  it('marks Urdu and Punjabi text runs RTL without touching the layout', () => {
    for (const language of ['ur', 'pa'] as const) {
      window.localStorage.clear();
      const { container, unmount } = renderChrome(language);
      const bdi = container.querySelectorAll('bdi[dir="rtl"]');
      // The language menu renders native names in isolated text runs; those are
      // the only places where RTL direction is allowed to appear.
      expect(bdi.length, `${language} should isolate its own script`).toBeGreaterThan(0);
      expect(document.documentElement.getAttribute('dir')).toBe('ltr');
      unmount();
    }
  });

  it('isolates each hero line in its language without directing the hero layout', () => {
    const expected = {
      en: ['Government services,', 'explained simply.', 'ltr'],
      ur: ['سرکاری خدمات،', 'آسان الفاظ میں۔', 'rtl'],
      pa: ['سرکاری خدمتاں،', 'سوکھی زبان وچ۔', 'rtl'],
    } as const;
    for (const language of supportedLanguages) {
      const { container, unmount } = renderChrome(language);
      const heading = container.querySelector('#hero-heading');
      const lines = heading?.querySelectorAll('bdi');
      expect(lines).toHaveLength(2);
      expect(lines?.[0]).toHaveTextContent(expected[language][0]);
      expect(lines?.[1]).toHaveTextContent(expected[language][1]);
      for (const line of Array.from(lines ?? [])) {
        expect(line).toHaveAttribute('dir', expected[language][2]);
        expect(line).toHaveAttribute('lang', language);
      }
      expect(heading).not.toHaveAttribute('dir');
      expect(heading?.closest('section')).not.toHaveAttribute('dir');
      unmount();
    }
  });

  it('never emits a right-to-left container direction', () => {
    for (const language of supportedLanguages) {
      window.localStorage.clear();
      const { container, unmount } = renderChrome(language);
      // Any element claiming dir=rtl must be an inline text isolation node (bdi)
      // or a text run — never a layout container.
      for (const el of Array.from(container.querySelectorAll('[dir="rtl"]'))) {
        expect(el.tagName.toLowerCase(), 'only <bdi> may carry dir=rtl').toBe('bdi');
      }
      unmount();
    }
  });
});
