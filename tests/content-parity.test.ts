// The en and ru versions of every level must match in structure, so that
// progress (ids and indexes) means the same thing in both languages.
// See docs/spec/i18n.md → "Progress is shared between languages".
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const root = join(import.meta.dirname, '..', 'src', 'content');
const levelsDir = join(root, 'levels');

type Level = {
  id: number;
  slug: string;
  weeks: number;
  landmark: string;
  badge: { emoji: string };
  missions: { id: string; steps: unknown[] }[];
  breaks: { id: string; see: string }[];
  traps: unknown[];
  selfCheck: unknown[];
  links: unknown[];
  cheatsheet: { cmd: string }[];
  quiz: { options: unknown[]; answer: number; code?: string }[];
};

function readLevel(lang: string, file: string): { data: Level; body: string } {
  const raw = readFileSync(join(levelsDir, lang, file), 'utf8');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`${lang}/${file}: no frontmatter`);
  return { data: parse(m[1]!) as Level, body: m[2]! };
}

/** The parts of a level that must be identical in both languages. */
export function structure(level: { data: Level; body: string }) {
  const d = level.data;
  return {
    id: d.id,
    slug: d.slug,
    weeks: d.weeks,
    landmark: d.landmark,
    badgeEmoji: d.badge.emoji,
    missions: d.missions.map((m) => ({ id: m.id, steps: m.steps.length })),
    breaks: d.breaks.map((b) => b.id),
    breakSee: d.breaks.map((b) => b.see),
    traps: d.traps.length,
    selfCheck: d.selfCheck.length,
    links: d.links.length,
    cheatsheetCmds: d.cheatsheet.map((c) => c.cmd),
    quiz: d.quiz.map((q) => ({ options: q.options.length, answer: q.answer, code: q.code ?? null })),
    widgets: [...level.body.matchAll(/<([A-Z]\w*)\b[^>]*\bclient:/g)].map((x) => x[1]),
    diagrams: [...level.body.matchAll(/<Diagram\s+name="([^"]+)"/g)].map((x) => x[1]),
  };
}

const enFiles = readdirSync(join(levelsDir, 'en')).filter((f) => f.endsWith('.mdx')).sort();
const ruFiles = readdirSync(join(levelsDir, 'ru')).filter((f) => f.endsWith('.mdx')).sort();

describe('level files', () => {
  it('every level exists in both languages', () => {
    expect(ruFiles).toEqual(enFiles);
  });

  it.each(enFiles)('%s has the same structure in en and ru', (file) => {
    const en = structure(readLevel('en', file));
    const ru = structure(readLevel('ru', file));
    expect(ru).toEqual(en);
  });

  it.each(enFiles)('%s file name matches its id and slug', (file) => {
    const { data } = readLevel('en', file);
    expect(file).toBe(`${data.id}-${data.slug}.mdx`);
  });
});

type Term = { term: string; plain: string; analogy: string; level: number; en?: string };

describe('glossary', () => {
  const en = parse(readFileSync(join(root, 'glossary', 'en.yaml'), 'utf8')) as Term[];
  const ru = parse(readFileSync(join(root, 'glossary', 'ru.yaml'), 'utf8')) as Term[];

  it('has the same terms, in the same order, with the same levels', () => {
    expect(ru.map((t) => t.en)).toEqual(en.map((t) => t.term));
    expect(ru.map((t) => t.level)).toEqual(en.map((t) => t.level));
  });
});
