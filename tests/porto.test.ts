import { describe, expect, it } from 'vitest';
import { portoLines as en } from '../src/data/porto.en';
import { portoLines as ru } from '../src/data/porto.ru';

describe("Porto's lines", () => {
  it('both languages have the same pools and line counts, at least 6 each', () => {
    expect(Object.keys(ru)).toEqual(Object.keys(en));
    for (const pool of Object.keys(en) as (keyof typeof en)[]) {
      expect(en[pool].length).toBeGreaterThanOrEqual(6);
      expect(ru[pool].length).toBe(en[pool].length);
    }
  });

  it('every line is at most 12 words', () => {
    for (const lines of [...Object.values(en), ...Object.values(ru)]) {
      for (const line of lines) {
        const words = line.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w));
        expect(words.length, line).toBeLessThanOrEqual(12);
      }
    }
  });
});
