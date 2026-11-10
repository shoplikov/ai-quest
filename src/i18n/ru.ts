import type { Dict } from './index';

// Russian interface strings. Typed against the English dictionary, so a
// missing key is a type error.
export const ru: Dict = {
  site: {
    name: 'AI Engineer Quest',
    subtitle: 'От «почему порт закрыт?» до «я это задеплоила». Уровень за уровнем.',
  },
  lang: {
    label: 'Язык',
    en: 'English',
    ru: 'Русский',
    switchTo: 'Переключить на русский',
  },
  nav: {
    label: 'Основная навигация',
    skip: 'Перейти к содержимому',
    home: 'AI Engineer Quest — на карту',
    map: 'Карта',
    skills: 'Навыки',
    glossary: 'Словарь',
    cheatsheets: 'Шпаргалки',
    menu: 'Меню',
    xpPill: '{xp} XP',
    xpLabel: 'Твой опыт: {xp} XP',
  },
  footer: {
    line: 'Сделано с заботой. Ломать — часть плана.',
    mentor: 'Для ментора',
    reset: 'Сбросить прогресс',
  },
  reset: {
    title: 'Начать заново?',
    body: 'Это сотрёт твой прогресс на этом устройстве. Точно?',
    confirm: 'Да, стереть',
    cancel: 'Оставить как есть',
    done: 'Прогресс стёрт. Карта снова чистая.',
  },
  view: {
    banner: 'Ты смотришь карту героя «{hero}» (только просмотр)',
    exit: 'Выйти',
    exited: 'Снова твоя карта.',
    disabled: 'Только просмотр: это чужая карта.',
  },
  notes: {
    noStorage: 'Этот браузер не даёт сайту сохранять данные. Прогресс проживёт, пока открыта эта страница.',
    brokenShare: 'Похоже, ссылка повреждена — поэтому вот твоя собственная карта.',
    close: 'Закрыть',
  },
  theme: {
    toDark: 'Включить тёмную тему',
    toLight: 'Включить светлую тему',
  },
  redirect: {
    title: 'AI Engineer Quest',
    choose: 'Выбери язык:',
  },
  plural: {
    week: { one: 'неделя', few: 'недели', many: 'недель', other: 'недели' },
    mission: { one: 'миссия', few: 'миссии', many: 'миссий', other: 'миссии' },
    day: { one: 'день', few: 'дня', many: 'дней', other: 'дня' },
    level: { one: 'уровень', few: 'уровня', many: 'уровней', other: 'уровня' },
    point: { one: 'балл', few: 'балла', many: 'баллов', other: 'балла' },
  },
};
