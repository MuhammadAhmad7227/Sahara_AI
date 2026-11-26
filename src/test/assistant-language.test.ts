/**
 * Runtime tests for the assistant's language contract.
 *
 * The static test in language-voice.test.ts proves the source no longer contains
 * the old override. This one proves the behaviour: ask the same question in three
 * languages and check the ANSWER comes back in the language that was requested,
 * with the facts unchanged.
 */
import { describe, expect, it } from 'vitest';
import { askAssistant } from '@/services/api/assistant';
import { supportedLanguages } from '@/i18n';

const QUESTION = 'How do I get a domicile certificate?';

async function ask(language: 'en' | 'ur' | 'pa') {
  return askAssistant({ question: QUESTION, language });
}

describe('Assistant answers in the requested language', () => {
  for (const language of supportedLanguages) {
    it(`${language}: returns an answer tagged with the requested language`, async () => {
      const answer = await ask(language);
      expect(answer.language).toBe(language);
      expect(answer.answer.length).toBeGreaterThan(40);
    });
  }

  it('does not fall back to English when the question is in Roman Urdu', async () => {
    // The old bug: Roman-Urdu keywords flipped the answer to Urdu even though
    // English was selected. The selection must win.
    const answer = await askAssistant({
      question: 'mujhe domicile chahiye, kya kaise banwana hai?',
      language: 'en',
    });
    expect(answer.language).toBe('en');
    expect(answer.answer).toMatch(/[A-Za-z]{3,}/);
  });

  it('answers a Punjabi request in Punjabi script, not English', async () => {
    const answer = await ask('pa');
    // Shahmukhi uses the Arabic block; an English answer would have none.
    expect(answer.answer).toMatch(/[\u0600-\u06FF]/);
  });

  it('answers an Urdu request in Urdu script', async () => {
    const answer = await ask('ur');
    expect(answer.answer).toMatch(/[\u0600-\u06FF]/);
  });

  it('keeps the verified facts identical across translations', async () => {
    const [en, ur, pa] = await Promise.all([ask('en'), ask('ur'), ask('pa')]);

    // The fee is data, not prose, so translation must not change it. When the
    // record has no verified fee, none of the languages may invent one either —
    // they must all take the "not currently verified" path instead.
    const fee = (a: { answer: string }) => a.answer.match(/PKR\s*([\d,]+)/)?.[1] ?? null;
    expect(fee(ur)).toBe(fee(en));
    expect(fee(pa)).toBe(fee(en));

    // Whichever branch is taken, all three agree that it was taken.
    const unverified = (a: { answer: string }) => !/PKR\s*[\d,]/.test(a.answer);
    expect(unverified(ur)).toBe(unverified(en));
    expect(unverified(pa)).toBe(unverified(en));

    // Sources are language-independent records.
    expect(ur.sources.map((s) => s.serviceId)).toEqual(en.sources.map((s) => s.serviceId));
    expect(pa.sources.map((s) => s.serviceId)).toEqual(en.sources.map((s) => s.serviceId));
    expect(ur.sources[0].publisher).toBe(en.sources[0].publisher);
  });

  it('discloses that matched demo records are unverified in every language', async () => {
    const [en, ur, pa] = await Promise.all([ask('en'), ask('ur'), ask('pa')]);
    expect(en.answer).toMatch(/demonstration record.*not verified/i);
    expect(en.disclaimer).toMatch(/unverified demonstration record/i);
    expect(ur.answer).toContain('تصدیق شدہ نہیں');
    expect(ur.disclaimer).toContain('غیر تصدیق شدہ');
    expect(pa.answer).toContain('تصدیق شدہ نئیں');
    expect(pa.disclaimer).toContain('غیر تصدیق شدہ');
  });

  it('never invents a record when none matches', async () => {
    const answer = await askAssistant({
      question: 'zzzz qqqq unanswerable nonsense xxxx',
      language: 'ur',
    });
    // Either it found something legitimate or it says so plainly — but the
    // "no reliable record" path must not claim facts.
    if (answer.noReliableRecord) {
      expect(answer.sources.length).toBe(0);
      expect(answer.answer).not.toMatch(/PKR/);
    } else {
      expect(answer.sources.length).toBeGreaterThan(0);
    }
  });
});
