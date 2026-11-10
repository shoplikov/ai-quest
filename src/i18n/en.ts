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
  nav: {
    label: 'Main',
    skip: 'Skip to content',
    home: 'AI Engineer Quest — back to the map',
    map: 'Map',
    skills: 'Skills',
    glossary: 'Glossary',
    cheatsheets: 'Cheat sheets',
    menu: 'Menu',
    xpPill: '{xp} XP',
    xpLabel: 'Your XP: {xp}',
  },
  footer: {
    line: 'Made with care. Breaking things is part of the plan.',
    mentor: 'For the mentor',
    reset: 'Reset my progress',
  },
  reset: {
    title: 'Start over?',
    body: 'This clears your progress on this device. Sure?',
    confirm: 'Yes, clear it',
    cancel: 'Keep my progress',
    done: 'Progress cleared. A fresh map awaits.',
  },
  view: {
    banner: "You're viewing {hero}'s map (read-only)",
    exit: 'Exit',
    exited: 'Back to your own map.',
    disabled: 'Read-only: this is a shared map.',
  },
  notes: {
    noStorage: "This browser won't let the site save. Your progress lasts until you close this page.",
    brokenShare: 'That share link looks broken, so here is your own map instead.',
    close: 'Close',
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
