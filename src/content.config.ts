// Content collections: level files (MDX, one per level and language) and
// the glossary (one YAML list per language). Schema from
// docs/spec/content-guide.md.
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';

export const LANDMARKS = ['tent', 'doors', 'workshop', 'harbour', 'library', 'lighthouse', 'book', 'rocket'] as const;

const text = z.string().trim().min(1);

const levelSchema = z.object({
  id: z.number().int().min(1).max(8),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: text,
  tagline: text.max(90),
  weeks: z
    .number()
    .positive()
    .refine((w) => Number.isInteger(w * 2), 'weeks must be in 0.5 steps'),
  landmark: z.enum(LANDMARKS),
  badge: z.object({ name: text, emoji: text }),
  skill: z.object({ name: text, junior: text, growing: text, middle: text }),
  itsNormal: text,
  analogy: z.object({ emoji: text, title: text, text: text }),
  missions: z
    .array(
      z.object({
        id: z.string().regex(/^m\d+$/),
        title: text,
        why: text,
        steps: z.array(text).min(1),
        check: text,
      }),
    )
    .min(3)
    .max(6),
  breaks: z
    .array(
      z.object({
        id: z.string().regex(/^b\d+$/),
        title: text,
        do: text,
        see: text,
        why: text,
        fix: text,
      }),
    )
    .min(3)
    .max(4),
  traps: z.array(z.object({ error: text, meaning: text, firstMove: text })).min(4).max(8),
  deliverable: z.object({ repo: text, sketch: text, demo: text }),
  selfCheck: z.array(text).min(4).max(5),
  quiz: z
    .array(
      z
        .object({
          q: text,
          code: text.optional(),
          options: z.array(text).min(3).max(4),
          answer: z.number().int().min(0),
          why: text,
        })
        .refine((q) => q.answer < q.options.length, 'answer must point at one of the options'),
    )
    .length(5),
  links: z.array(z.object({ title: text, url: z.url(), why: text })).min(3).max(5),
  cheatsheet: z.array(z.object({ cmd: text, does: text })).min(8).max(14),
  kindNote: text,
});

const levels = defineCollection({
  // Ids come from the path ("en/2-ports"), not the slug, so both languages coexist.
  loader: glob({
    pattern: '{en,ru}/*.mdx',
    base: './src/content/levels',
    generateId: ({ entry }) => entry.replace(/\.mdx$/, ''),
  }),
  schema: levelSchema
    .refine((l) => new Set(l.missions.map((m) => m.id)).size === l.missions.length, 'mission ids must be unique')
    .refine((l) => new Set(l.breaks.map((b) => b.id)).size === l.breaks.length, 'break ids must be unique'),
});

const glossaryTerm = z.object({
  term: text,
  plain: text,
  analogy: text,
  level: z.number().int().min(1).max(8),
  /** Russian file only: the English term, shown in brackets. */
  en: text.optional(),
});

// Each glossary file is a plain YAML list; ids are the position, so the
// order is the same in both languages.
const listParser = (raw: string) =>
  (parseYaml(raw) as Record<string, unknown>[]).map((t, i) => ({ id: String(i + 1).padStart(3, '0'), ...t }));

const glossaryEn = defineCollection({
  loader: file('src/content/glossary/en.yaml', { parser: listParser }),
  schema: glossaryTerm,
});
const glossaryRu = defineCollection({
  loader: file('src/content/glossary/ru.yaml', { parser: listParser }),
  schema: glossaryTerm,
});

export const collections = { levels, glossaryEn, glossaryRu };
