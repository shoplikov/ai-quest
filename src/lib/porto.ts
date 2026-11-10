// Pick Porto's lines by language and situation.
import { portoLines as en, type PortoPool } from '../data/porto.en';
import { portoLines as ru } from '../data/porto.ru';
import type { Lang } from '../i18n';

export type { PortoPool };

export function portoPool(lang: Lang, pool: PortoPool): readonly string[] {
  return (lang === 'ru' ? ru : en)[pool];
}

/** A random line, or a stable one when a seed is given. */
export function portoLine(lang: Lang, pool: PortoPool, seed?: number): string {
  const lines = portoPool(lang, pool);
  const i = seed === undefined ? Math.floor(Math.random() * lines.length) : Math.abs(Math.floor(seed)) % lines.length;
  return lines[i]!;
}
