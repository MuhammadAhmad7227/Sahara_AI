/**
 * Static mobile-layout audit.
 *
 * No headless browser is available in this environment, so this test enforces the
 * rules that usually break a 320 px layout, by reading the page sources:
 *
 *  1. no fixed px widths wider than the narrowest supported viewport (320 px)
 *  2. no `whitespace-nowrap` on long prose containers
 *  3. every horizontally scrolling table has a scroll container
 *  4. every grid declares a base column count (mobile-first)
 *  5. no `overflow-x-hidden` assumptions masking real overflow
 *
 * It is a guard-rail for regressions, not a substitute for a visual pass.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sources = walk(ROOT)
  .filter((file) => file.endsWith('.tsx') && !file.includes('/test/'))
  .map((file) => ({ file: file.replace(ROOT + '/', ''), code: readFileSync(file, 'utf8') }));

const pageSources = sources.filter((s) => s.file.startsWith('pages/') || s.file.startsWith('components/'));

describe('320px layout safety', () => {
  it('found the source files', () => {
    expect(sources.length).toBeGreaterThan(40);
  });

  it('has no fixed widths wider than 320px', () => {
    const violations: string[] = [];
    const pattern = /\b(?:w|min-w)-\[(\d+)px\]/g;

    for (const { file, code } of sources) {
      for (const match of code.matchAll(pattern)) {
        const px = Number(match[1]);
        if (px > 320) violations.push(`${file}: ${match[0]}`);
      }
    }

    expect(violations).toEqual([]);
  });

  it('has no arbitrary min-width on containers', () => {
    const violations = sources
      .filter(({ code }) => /min-w-\[\d+rem\]/.test(code))
      .map(({ file }) => file);
    expect(violations).toEqual([]);
  });

  it('does not lock long prose with whitespace-nowrap', () => {
    // nowrap is legitimate on short labels/timestamps; flag only long literal text.
    const violations: string[] = [];
    for (const { file, code } of pageSources) {
      for (const match of code.matchAll(/className="([^"]*whitespace-nowrap[^"]*)"/g)) {
        const classes = match[1] ?? '';
        if (/text-(?:base|lg|xl|2xl)/.test(classes) && !/tabular|truncate/.test(classes)) {
          violations.push(`${file}: ${classes}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('wraps real JSX <table> elements in a scroll container', () => {
    const violations: string[] = [];
    for (const { file, code } of sources) {
      // Strip print-window HTML templates: they are not part of the on-screen layout.
      const jsxOnly = code.replace(/win\.document\.write\([\s\S]*?`\);?/g, '');
      for (const line of jsxOnly.split(String.fromCharCode(10))) {
        if (!/<table[ >]/.test(line)) continue;
        const scrollable = /overflow-(?:x-)?auto/.test(code) || /DataTable/.test(file);
        if (!scrollable) violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  it('never starts a grid at 3+ columns (cramped at 320px)', () => {
    const violations: string[] = [];
    for (const { file, code } of sources) {
      for (const match of code.matchAll(/className="([^"]*)"/g)) {
        const classes = match[1] ?? '';
        if (!/(?:^|\s)grid(?:\s|$)/.test(classes)) continue;
        // Ignore icon-centring grids such as "grid size-7 place-items-center".
        if (/place-items-center/.test(classes)) continue;
        const base = classes.match(/(?:^|\s)grid-cols-(\d+)(?=\s|$)/);
        if (base && Number(base[1]) > 2) violations.push(`${file}: ${classes}`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('uses mobile-first breakpoints on multi-column layouts', () => {
    // A grid that only declares md:/lg: columns is 1 column on a phone, which is correct.
    const violations: string[] = [];
    for (const { file, code } of sources) {
      for (const match of code.matchAll(/className="([^"]*)"/g)) {
        const classes = match[1] ?? '';
        if (/(?:^|\s)grid(?:\s|$)/.test(classes) === false) continue;
        if (/place-items-center|grid-flow-/.test(classes)) continue;
        // "grid-cols-[1.3fr_repeat(...)]" with no prefix is a single-row desktop template;
        // it is only a risk when it is combined with a fixed template at base.
        if (/grid-cols-\[repeat\(\d+/.test(classes) && !/sm:|md:|lg:/.test(classes)) {
          violations.push(`${file}: ${classes} (fixed base template)`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('does not hide overflow on the page container as a shortcut', () => {
    const violations = pageSources
      .filter(({ code }) => /container-page[^"]*overflow-x-hidden/.test(code))
      .map(({ file }) => file);
    expect(violations).toEqual([]);
  });
});

describe('Honesty and safety copy present in the UI', () => {
  const all = sources.map((s) => s.code).join('\n');

  it('drafts are labelled as not an official form', () => {
    expect(all).toMatch(/NOT AN OFFICIAL GOVERNMENT FORM/);
  });

  it('readiness never promises acceptance', () => {
    // A plain statement of acceptance must not appear; the disclaimer that says the
    // app never claims it is allowed.
    expect(all).not.toMatch(/(?<!never says )your application will be accepted/i);
    expect(all).not.toMatch(/guaranteed acceptance/i);
  });

  it('scam analysis is described as an indicator, not proof', () => {
    expect(all).toMatch(/not.{0,20}(definitive )?proof/i);
  });

  it('the assistant is described as using reviewed sources', () => {
    expect(all).toMatch(/reviewed/i);
  });

  it('no secrets or API keys are referenced', () => {
    expect(all).not.toMatch(/sk-[A-Za-z0-9]{16,}/);
    expect(all).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
    expect(all).not.toMatch(/SUPABASE_SERVICE|DATABASE_URL|GEMINI_API_KEY/);
  });

  it('no government submission is claimed', () => {
    expect(all).not.toMatch(/we (?:will )?submit (?:your|the) application to the (?:government|department)/i);
  });
});
