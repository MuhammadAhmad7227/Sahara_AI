/**
 * Design-system guard-rails.
 *
 * The redesign brief forbids a specific set of "AI-generated website" habits.
 * Those are easy to reintroduce one component at a time, so they are asserted
 * here rather than left to review discipline.
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

const files = walk(ROOT)
  .filter((f) => /\.(tsx?|css)$/.test(f) && !f.includes('/test/'))
  .map((f) => ({ path: f.replace(ROOT + '/', ''), code: readFileSync(f, 'utf8') }));

const uiFiles = files.filter((f) => f.path.startsWith('pages/') || f.path.startsWith('components/'));
const allCode = files.map((f) => f.code).join('\n');

describe('Colour system', () => {
  it('keeps raw hex values out of components (tokens only)', () => {
    const violations: string[] = [];
    for (const { path, code } of uiFiles) {
      // The orb and the brand mark legitimately define gradient stop colours:
      // they ARE the palette. Everything else must use a token class.
      if (/SaharaOrb|BrandMark|Progress\.tsx/.test(path)) continue;
      // Print-window HTML is a separate document with its own inline CSS.
      const scrubbed = code.replace(/win\.document\.write\([\s\S]*?`\);?/g, '');
      for (const match of scrubbed.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
        violations.push(`${path}: ${match[0]}`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('never uses the generic purple/pink AI gradients', () => {
    expect(allCode).not.toMatch(/from-(purple|violet|fuchsia|pink)-\d/);
    expect(allCode).not.toMatch(/to-(purple|violet|fuchsia|pink)-\d/);
    expect(allCode).not.toMatch(/\btext-transparent bg-clip-text\b/);
  });

  it('does not use the old teal brand palette', () => {
    expect(allCode).not.toMatch(/#0f3d3a|#1b4a47|#8fd3c5|#072320/);
  });
});

describe('Depth system', () => {
  it('uses the four-level shadow scale, not ad-hoc black shadows', () => {
    const violations = uiFiles
      .filter(({ code }) => /shadow-\[0_(1[5-9]|[2-9]\d)px/.test(code))
      .map(({ path }) => path);
    expect(violations).toEqual([]);
  });

  it('reserves shadow-4 for hero objects and modal surfaces', () => {
    /*
     * Level 4 is the highest elevation in the system. It is allowed on: the hero
     * object (HomePage), night command panels, the Drawer primitive, the mobile
     * navigation drawer (a full-screen modal), the admin shell and the footer.
     * Anything else using it is elevation creep.
     */
    const allowed = /HomePage|Drawer|AdminLayout|Footer|Header/;
    const offenders = uiFiles.filter(({ path, code }) => /shadow-4/.test(code) && !allowed.test(path));
    expect(offenders.map((o) => o.path)).toEqual([]);
  });
});

describe('Motion and accessibility', () => {
  it('respects prefers-reduced-motion globally', () => {
    const css = files.find((f) => f.path === 'styles/index.css')?.code ?? '';
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/animation-duration:\s*0\.001ms\s*!important/);
    expect(css).toMatch(/\[data-reveal\]/);
  });

  it('keeps a single visible focus treatment', () => {
    const css = files.find((f) => f.path === 'styles/index.css')?.code ?? '';
    expect(css).toMatch(/:focus-visible\s*\{/);
  });

  it('does not animate infinite motion on more than the orb primitives', () => {
    // Guards against "everything floats" drift.
    const animated = uiFiles.filter(({ code }) => /animate-(float|orb-breathe|orb-spin)/.test(code));
    expect(animated.length).toBeLessThanOrEqual(3);
  });

  it('puts a skip link before the header', () => {
    const layout = files.find((f) => f.path === 'components/layout/PublicLayout.tsx')?.code ?? '';
    const skipIndex = layout.indexOf('Skip to main content');
    const headerIndex = layout.indexOf('<Header />');
    expect(skipIndex).toBeGreaterThan(-1);
    expect(skipIndex).toBeLessThan(headerIndex);
  });
});

describe('Brand and honesty', () => {
  it('states independence from government', () => {
    expect(allCode).toMatch(/not a government service|independent assistant/i);
  });

  it('does not imply official affiliation in the brand mark', () => {
    const brand = files.find((f) => f.path === 'components/common/BrandMark.tsx')?.code ?? '';
    expect(brand).toMatch(/not.*government|independent/i);
  });

  it('labels the demo conversation on the homepage', () => {
    const home = files.find((f) => f.path === 'pages/public/HomePage.tsx')?.code ?? '';
    expect(home).toMatch(/demonstration/i);
  });
});

describe('Typography scale', () => {
  it('does not use display sizes above 3.6rem (no oversized headings)', () => {
    const violations: string[] = [];
    for (const { path, code } of uiFiles) {
      for (const m of code.matchAll(/text-\[(\d+(?:\.\d+)?)rem\]/g)) {
        if (Number(m[1]) > 3.6) violations.push(`${path}: ${m[0]}`);
      }
    }
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('limits large headings to the hero and section titles', () => {
    const big = uiFiles.filter(({ code }) => /text-\[3(\.\d+)?rem\]/.test(code));
    // Only the homepage hero may reach ~3.5rem.
    expect(big.every(({ path }) => path === 'pages/public/HomePage.tsx')).toBe(true);
  });
});
