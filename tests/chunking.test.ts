import { describe, expect, it } from 'vitest';
import { answerSpan, averageLength, chunk, holdsAnswer, paragraphs, segments, sentences } from '../src/lib/chunking';
import { en } from '../src/i18n/en';
import { ru } from '../src/i18n/ru';

const dicts = { en: en.widgets.chunkingVisualiser, ru: ru.widgets.chunkingVisualiser };

describe('chunk', () => {
  it('fixed windows step by size × (1 − overlap) and reach the end', () => {
    const text = 'x'.repeat(250);
    expect(chunk(text, 'fixed', 100, 0)).toEqual([
      { start: 0, end: 100 },
      { start: 100, end: 200 },
      { start: 200, end: 250 },
    ]);
    expect(chunk(text, 'fixed', 100, 0.5).map((c) => c.start)).toEqual([0, 50, 100, 150]);
  });

  it('by sentence packs whole sentences and never passes size (unless one sentence is longer)', () => {
    const text = 'One two. Three four five. Six. Seven eight nine ten.';
    const chunks = chunk(text, 'sentence', 30, 0);
    expect(chunks.map((c) => text.slice(c.start, c.end))).toEqual(['One two. Three four five. Six.', 'Seven eight nine ten.']);
  });

  it('by sentence overlap repeats the last sentences of the previous chunk', () => {
    const text = 'Aaaa aaaa. Bbbb bbbb. Cccc cccc. Dddd dddd.';
    const chunks = chunk(text, 'sentence', 25, 0.5).map((c) => text.slice(c.start, c.end));
    expect(chunks).toEqual(['Aaaa aaaa. Bbbb bbbb.', 'Bbbb bbbb. Cccc cccc.', 'Cccc cccc. Dddd dddd.']);
  });

  it('by paragraph gives one chunk per paragraph and ignores size', () => {
    const text = 'First para.\n\nSecond para here.\n\n  Third.';
    expect(chunk(text, 'paragraph', 100, 0.3).map((c) => text.slice(c.start, c.end))).toEqual([
      'First para.',
      'Second para here.',
      'Third.',
    ]);
  });

  it('segments mark overlap and the answer', () => {
    const segs = segments(10, [{ start: 0, end: 6 }, { start: 4, end: 10 }], { start: 5, end: 7 });
    expect(segs.map((s) => [s.start, s.end, s.chunks.length, s.answer])).toEqual([
      [0, 4, 1, false],
      [4, 5, 2, false],
      [5, 6, 2, true],
      [6, 7, 1, true],
      [7, 10, 1, false],
    ]);
    expect(averageLength([{ start: 0, end: 6 }, { start: 4, end: 10 }])).toBe(6);
  });
});

for (const [lang, t] of Object.entries(dicts)) {
  describe(`sample text (${lang})`, () => {
    const answer = answerSpan(t.text, t.answer);

    it('has 5 paragraphs, about 1,200 characters, and the answer in two sentences', () => {
      expect(paragraphs(t.text)).toHaveLength(5);
      expect(t.text.length).toBeGreaterThan(900);
      expect(t.text.length).toBeLessThan(1400);
      const inside = sentences(t.text).filter((s) => s.start >= answer.start && s.end <= answer.end);
      expect(inside).toHaveLength(2);
    });

    it('try this: fixed 120 with no overlap cuts the answer', () => {
      expect(holdsAnswer(chunk(t.text, 'fixed', 120, 0), answer)).toBe(false);
    });

    it('try this: raising the overlap at size 120 heals it', () => {
      const healing = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50].filter((o) => holdsAnswer(chunk(t.text, 'fixed', 120, o / 100), answer));
      expect(healing.length).toBeGreaterThan(0);
    });

    it('try this: by sentence and by paragraph keep the answer whole', () => {
      expect(holdsAnswer(chunk(t.text, 'sentence', 120, 0), answer)).toBe(true);
      expect(holdsAnswer(chunk(t.text, 'paragraph', 120, 0), answer)).toBe(true);
    });

    it('every chunk is inside the text and the fixed chunks cover all of it', () => {
      for (const size of [100, 220, 600]) {
        const c = chunk(t.text, 'fixed', size, 0);
        expect(c[0]!.start).toBe(0);
        expect(c[c.length - 1]!.end).toBe(t.text.length);
      }
    });
  });
}
