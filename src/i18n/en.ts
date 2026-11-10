import type { PluralForms } from './types';

// English interface strings. `ru.ts` must have exactly the same keys.
export const en = {
  site: {
    name: 'AI Engineer Quest',
    subtitle: "From 'why is the port closed?' to 'I shipped it.' One level at a time.",
  },
  lang: {
    label: 'Language',
    en: 'English',
    ru: 'Русский',
    switchTo: 'Switch to English',
  },
  theme: {
    toDark: 'Switch to dark theme',
    toLight: 'Switch to light theme',
  },
  redirect: {
    title: 'AI Engineer Quest',
    choose: 'Choose a language:',
  },
  plural: {
    week: { one: 'week', other: 'weeks' } as PluralForms,
    mission: { one: 'mission', other: 'missions' } as PluralForms,
    day: { one: 'day', other: 'days' } as PluralForms,
    level: { one: 'level', other: 'levels' } as PluralForms,
    point: { one: 'point', other: 'points' } as PluralForms,
  },
} as const;
