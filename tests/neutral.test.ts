import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The learner is addressed in gender-neutral wording (docs/spec/i18n.md).
// This test catches the common slips. Story characters inside analogies
// may have a gender: list such lines in ALLOW.
const root = join(import.meta.dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const levelFiles = (lang: string) =>
  readdirSync(join(root, 'src/content/levels', lang)).map((f) => `src/content/levels/${lang}/${f}`);

const RU_FILES = ['src/i18n/ru.ts', 'src/data/pages.ru.ts', 'src/data/porto.ru.ts', ...levelFiles('ru')];
const EN_FILES = ['src/i18n/en.ts', 'src/data/pages.en.ts', 'src/data/porto.en.ts', 'README.md', ...levelFiles('en')];

// «ты написала», «Я сделала», «сама», «героиня», «готова» …
const RU_PATTERNS = [
  /(?<![а-яё])(ты|я)\s+(бы\s+|уже\s+|не\s+|раньше\s+|только\s+)*[а-яё]+ла(сь)?(?![а-яё])/giu,
  /(?<![а-яё])(ты|тебе)\s+[^.!?\n]{0,30}(?<![а-яё])сама(?![а-яё])/giu,
  /героин/giu,
  /(?<![а-яё])(ты|я)\s+(не\s+)?(готова|должна|уверена|рада|одна)(?![а-яё])/giu,
  /(укротительниц|хранительниц|волшебниц|исследовательниц|новеньк)/giu,
];
const ALLOW: RegExp[] = [
  /Я просила/u, // café reviewers in level 6
  /я задала/u,
  /я бы .*ли(?![а-яё])/u,
];
const EN_PATTERN = /\b(she|her|hers|herself)\b/gi;
const EN_ALLOW: RegExp[] = [/she tried to call/];

function hits(file: string, patterns: RegExp[], allow: RegExp[]): string[] {
  const out: string[] = [];
  read(file)
    .split('\n')
    .forEach((line, i) => {
      if (allow.some((a) => a.test(line))) return;
      for (const p of patterns) {
        p.lastIndex = 0;
        const m = p.exec(line);
        if (m) out.push(`${file}:${i + 1}: ${m[0]}`);
      }
    });
  return out;
}

describe('neutral wording', () => {
  it('Russian text has no feminine forms about the learner', () => {
    expect(RU_FILES.flatMap((f) => hits(f, RU_PATTERNS, ALLOW))).toEqual([]);
  });
  it('English text does not call the learner she/her', () => {
    expect(EN_FILES.flatMap((f) => hits(f, [EN_PATTERN], EN_ALLOW))).toEqual([]);
  });
});
