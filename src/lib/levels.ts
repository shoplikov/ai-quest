// Server-side helpers that read the level collection for one language.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n';
import { levelsMeta, type LevelMeta } from '../data/levels-meta';

export type LevelEntry = CollectionEntry<'levels'>;

export type LevelSummary = {
  id: number;
  slug: string;
  title: string;
  weeks: number;
  landmark: LevelMeta['landmark'];
  badge: { name: string; emoji: string };
  missions: { id: string; title: string }[];
  /** False while the level file has not been written yet. */
  exists: boolean;
};

export async function getLevelEntries(lang: Lang): Promise<LevelEntry[]> {
  const all = await getCollection('levels', (e) => e.id.startsWith(`${lang}/`));
  return all.sort((a, b) => a.data.id - b.data.id);
}

export async function getLevelEntry(lang: Lang, id: number): Promise<LevelEntry | undefined> {
  return (await getLevelEntries(lang)).find((e) => e.data.id === id);
}

/** All eight levels for the map, from the files where they exist. */
export async function getLevelSummaries(lang: Lang): Promise<LevelSummary[]> {
  const entries = await getLevelEntries(lang);
  return levelsMeta.map((meta) => {
    const e = entries.find((x) => x.data.id === meta.id);
    if (e) {
      return {
        id: e.data.id,
        slug: e.data.slug,
        title: e.data.title,
        weeks: e.data.weeks,
        landmark: e.data.landmark,
        badge: e.data.badge,
        missions: e.data.missions.map((m) => ({ id: m.id, title: m.title })),
        exists: true,
      };
    }
    return {
      id: meta.id,
      slug: meta.slug,
      title: meta.title[lang],
      weeks: meta.weeks,
      landmark: meta.landmark,
      badge: { name: meta.badge[lang], emoji: meta.emoji },
      missions: [],
      exists: false,
    };
  });
}
