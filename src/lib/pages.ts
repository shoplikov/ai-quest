// Text of the non-level pages, by language.
import { pages as en } from '../data/pages.en';
import { pages as ru } from '../data/pages.ru';
import type { Pages } from '../data/pages.types';
import type { Lang } from '../i18n';

export type { Pages };

export function getPages(lang: Lang): Pages {
  return lang === 'ru' ? ru : en;
}
