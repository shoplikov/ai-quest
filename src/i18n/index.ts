import { en } from './en';
import { ru } from './ru';
import type { Leaves, PluralForms, Widen } from './types';

export type { PluralForms } from './types';

export const languages = ['en', 'ru'] as const;
export type Lang = (typeof languages)[number];
export type Dict = Widen<typeof en>;
export type Key = Leaves<Dict>;

export const LANG_STORAGE_KEY = 'aiquest:lang';

const dicts: Record<Lang, Dict> = { en, ru };

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

export function getDict(lang: Lang): Dict {
  return dicts[lang];
}

/** Fill `{name}` placeholders. */
export function fill(text: string, vars: Record<string, string | number> = {}): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** Look up a string by dotted key, e.g. t('en', 'nav.map'). */
export function t(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let node: unknown = dicts[lang];
  for (const part of key.split('.')) {
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node !== 'string') throw new Error(`Missing string: ${lang}.${key}`);
  return vars ? fill(node, vars) : node;
}

/** The right word for a count: pluralWord('ru', 5, forms) → "недель". */
export function pluralWord(lang: Lang, n: number, forms: PluralForms): string {
  const category = new Intl.PluralRules(lang).select(n) as keyof PluralForms;
  return forms[category] ?? forms.other;
}

/** Number and word: plural('ru', 2, forms) → "2 недели". */
export function plural(lang: Lang, n: number, forms: PluralForms): string {
  return `${formatNumber(lang, n)} ${pluralWord(lang, n, forms)}`;
}

export function formatNumber(lang: Lang, n: number): string {
  return new Intl.NumberFormat(lang).format(n);
}

export function formatDate(lang: Lang, iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

/** Build a URL inside one language: localePath('ru', '/level/2') → "/ru/level/2". */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

/** The same page in another language: "/en/level/2" → "/ru/level/2". */
export function switchLangPath(pathname: string, to: Lang): string {
  const match = pathname.match(/^\/(en|ru)(\/.*)?$/);
  if (!match) return `/${to}/`;
  return `/${to}${match[2] ?? '/'}`;
}

/** Pick a language for the root page: saved choice → browser language → en. */
export function pickLang(saved: string | null, browserLangs: readonly string[]): Lang {
  if (isLang(saved)) return saved;
  for (const l of browserLangs) {
    if (l.toLowerCase().startsWith('ru')) return 'ru';
    if (l.toLowerCase().startsWith('en')) return 'en';
  }
  return 'en';
}
