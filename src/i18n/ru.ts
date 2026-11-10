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
