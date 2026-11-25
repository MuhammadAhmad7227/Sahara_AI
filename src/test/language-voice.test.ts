/**
 * Guard rails for language + voice behaviour.
 *
 * These are the invariants that were broken before and must never regress:
 *   - the answer language is whatever the user selected;
 *   - Punjabi is never spoken or recognised with an Urdu/English locale;
 *   - a missing voice/model is reported, never faked;
 *   - technical literals (locales, component internals) stay out of the UI;
 *   - a language switch never reverses navigation order.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dictionaries, speechRecognitionLocale, languageMeta, supportedLanguages, TERMINOLOGY } from '@/i18n';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

function walk(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((entry) => {
    const rel = join(dir, entry);
    return statSync(join(ROOT, rel)).isDirectory() ? walk(rel) : [rel];
  });
}

const sourceFiles = walk('src').filter((f) => /\.(ts|tsx)$/.test(f) && !f.includes('/test/'));

describe('Answer language follows the selection', () => {
  it('does not override an explicit English selection with keyword detection', () => {
    const api = read('src/services/api/assistant.ts');
    // The old pickLanguage() returned 'ur' for Roman-Urdu keywords even when the
    // caller asked for English. resolveLanguage must return what it was given.
    expect(api).not.toMatch(/function pickLanguage/);
    expect(api).toContain('function resolveLanguage(requested: Language): Language {');
    expect(api).toMatch(/return requested;/);
  });

  it('localises every answer template instead of prepending a note to English', () => {
    const api = read('src/services/api/assistant.ts');
    expect(api).toContain('const copy = {');
    // All three locales must supply the same structural keys.
    for (const key of ['intro:', 'department:', 'documents:', 'steps:', 'fee:', 'closing:']) {
      const occurrences = api.split(key).length - 1;
      expect(occurrences, `template key ${key} must appear once per language`).toBeGreaterThanOrEqual(3);
    }
    // The English-with-a-note pattern is gone.
    expect(api).not.toContain('languageNote');
  });

  it('sends the selected language explicitly on every request', () => {
    const page = read('src/pages/public/AssistantPage.tsx');
    expect(page).toMatch(/askAssistant\(\{\s*question:.*language: answerLanguage/s);
  });

  it('re-selects the answer language when the interface language changes', () => {
    const page = read('src/pages/public/AssistantPage.tsx');
    expect(page).toMatch(/useEffect\(\(\) => \{\s*setAnswerLanguage\(language\);/);
  });
});

describe('Voice never uses the wrong locale', () => {
  it('maps each language to its own speech locale', () => {
    expect(speechRecognitionLocale.en).toBe('en-PK');
    expect(speechRecognitionLocale.ur).toBe('ur-PK');
    expect(speechRecognitionLocale.pa).toBe('pa-PK');
    // No language may share a locale with another.
    expect(new Set(Object.values(speechRecognitionLocale)).size).toBe(3);
  });

  it('speaks Punjabi with a Punjabi voice, never the Urdu one', () => {
    const hook = read('src/hooks/useSpeechSynthesis.ts');
    expect(hook).toContain("pa: 'pa-PK'");
    expect(hook).toContain("pa: ['pa-PK', 'pa-IN', 'pa-Guru-IN', 'pa', 'pnb']");
    // Guard the exact bug: a ternary that reads everything non-English with ur-PK.
    expect(hook).not.toMatch(/'en-PK' : 'ur-PK'/);
  });

  it('reports a missing voice instead of reading the wrong one', () => {
    const hook = read('src/hooks/useSpeechSynthesis.ts');
    expect(hook).toMatch(/if \(!voice\) \{[\s\S]{0,200}setState\('error'\)/);
    const button = read('src/components/ai/ListenButton.tsx');
    expect(button).toContain('hasVoiceFor');
    expect(button).toContain('lang.unsupportedVoiceOutput');
  });

  it('implements the full playback state machine', () => {
    const hook = read('src/hooks/useSpeechSynthesis.ts');
    for (const state of ['idle', 'speaking', 'paused', 'error']) {
      expect(hook).toContain(`'${state}'`);
    }
    expect(hook).toContain('window.speechSynthesis.pause()');
    expect(hook).toContain('window.speechSynthesis.resume()');
    expect(hook).toContain('window.speechSynthesis.cancel()');
  });

  it('cancels playback when the hook unmounts', () => {
    const hook = read('src/hooks/useSpeechSynthesis.ts');
    expect(hook).toMatch(/removeEventListener\('voiceschanged'[\s\S]{0,120}speechSynthesis\.cancel\(\)/);
  });

  it('every assistant message offers Listen', () => {
    const message = read('src/components/assistant/ChatMessage.tsx');
    expect(message).toContain('<ListenButton');
    expect(message).toContain("t('action.copy')");
    expect(message).toContain("t('action.helpful')");
  });
});

describe('Speech input is honest about what it cannot do', () => {
  it('uses the shared locale instead of the raw language code', () => {
    const page = read('src/pages/public/AssistantPage.tsx');
    expect(page).toContain('language: speechLocale');
    expect(page).not.toMatch(/language: answerLanguage === 'en' \? 'en-PK' : 'ur-PK'/);
  });

  it('surfaces an unsupported-locale message from the recognition engine', () => {
    const hook = read('src/hooks/useSpeechRecognition.ts');
    expect(hook).toContain("'language-not-supported'");
    expect(hook).toContain('languageUnsupported');
  });

  it('shows a written fallback, not a dead microphone', () => {
    const page = read('src/pages/public/AssistantPage.tsx');
    expect(page).toContain("t('voice.languageUnsupported'");
    expect(page).toContain("t('voice.browserUnsupported')");
  });

  it('does not claim Punjabi speech support anywhere in the copy', () => {
    for (const lang of supportedLanguages) {
      const strings = Object.entries(dictionaries[lang])
        .map(([, value]) => value)
        .join(' ');
      expect(strings.toLowerCase()).not.toMatch(/punjabi voice (is )?supported/);
      expect(strings).not.toMatch(/پنجابی آواز کی شناخت دستیاب ہے/);
    }
  });
});

describe('Language changes type, never layout', () => {
  it('declares a text direction per language but an LTR layout for all', () => {
    for (const lang of supportedLanguages) {
      expect(['ltr', 'rtl']).toContain(languageMeta[lang].dir);
    }
    const ctx = read('src/contexts/LanguageContext.tsx');
    expect(ctx).toContain("layoutDir: 'ltr'");
    expect(ctx).not.toMatch(/documentElement\.dir\s*=\s*dir/);
  });

  it('keeps the navigation order identical in every language', () => {
    const nav = read('src/components/layout/navigation.ts');
    const order = [...nav.matchAll(/labelKey: 'nav\.(\w+)'/g)].map((m) => m[1]);
    expect(order.slice(0, 2)).toEqual(['services', 'assistant']);
    // No RTL-only reversal utilities may appear in layout code.
    for (const file of sourceFiles.filter((f) => f.includes('/layout/'))) {
      expect(read(file), file).not.toMatch(/flex-row-reverse|order-\[|\.reverse\(\)/);
    }
  });

  it('has no RTL layout overrides left in the stylesheet', () => {
    const css = read('src/styles/index.css');
    // Only text-level bidi rules may be scoped to [dir='rtl'].
    const rtlRules = [...css.matchAll(/\[dir='rtl'\][^{]*\{([^}]*)\}/g)].map((m) => m[1]);
    for (const body of rtlRules) {
      expect(body).not.toMatch(/flex-direction|margin|padding|left|right|float|transform/);
    }
  });
});

describe('3D and video architecture stays honest', () => {
  const visuals = read('src/components/visuals/ThreeDSection.tsx');

  it('ships no 3D library in the main bundle', () => {
    // The 3D renderer must be a lazy chunk, not a top-level import.
    expect(visuals).toContain("import { Suspense, lazy");
    expect(visuals).not.toMatch(/^import .*from 'three'/m);
    expect(visuals).not.toMatch(/^import .*from '@react-three/m);
  });

  it('invents no video URLs or model files', () => {
    // No hard-coded media paths: assets arrive through props only.
    expect(visuals).not.toMatch(/\.(mp4|webm|glb|gltf)['"`]/);
    expect(visuals).not.toMatch(/https?:\/\/[^'"`\s]+/);
  });

  it('never autoplays video', () => {
    expect(visuals).not.toContain('autoPlay');
    expect(visuals).toContain('preload="none"');
    expect(visuals).not.toContain('muted');
  });

  it('offers captions and a text alternative', () => {
    expect(visuals).toContain('kind="captions"');
    expect(visuals).toContain('visual.videoNotAvailableBody');
  });

  it('renders an honest placeholder when no asset exists', () => {
    expect(visuals).toContain('visual.notAvailable');
    expect(visuals).toContain('visual.noSteps');
  });

  it('exports all four preparation components', () => {
    for (const name of [
      'ThreeDSection',
      'InteractiveProcessVisual',
      'FeatureVisualization',
      'TutorialVideoCard',
    ]) {
      expect(visuals).toContain(`export function ${name}`);
    }
  });
});

describe('Translations stay complete and consistent', () => {
  it('keeps the terminology glossary aligned across languages', () => {
    for (const [term, values] of Object.entries(TERMINOLOGY)) {
      expect(values.en, `term ${term}`).toBeTruthy();
      expect(values.ur, `term ${term}`).toBeTruthy();
      expect(values.pa, `term ${term}`).toBeTruthy();
    }
  });

  it('has a native name and a coverage note for every language', () => {
    for (const lang of supportedLanguages) {
      expect(languageMeta[lang].native).toBeTruthy();
      expect(languageMeta[lang].note).toBeTruthy();
    }
  });
});
