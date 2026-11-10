import { describe, expect, it } from 'vitest';
import { getDict, pickLang, plural, pluralWord, switchLangPath, t, fill } from '../src/i18n';
import { en } from '../src/i18n/en';
import { ru } from '../src/i18n/ru';

describe('Russian plurals', () => {
  const missions = ru.plural.mission;
  const weeks = ru.plural.week;
  const days = ru.plural.day;
  it.each([
    [1, 'миссия'],
    [2, 'миссии'],
    [5, 'миссий'],
    [11, 'миссий'],
    [21, 'миссия'],
    [22, 'миссии'],
  ])('%i → %s', (n, word) => {
    expect(pluralWord('ru', n, missions)).toBe(word);
  });

  it('weeks and days use three forms', () => {
    expect(plural('ru', 1, weeks)).toBe('1 неделя');
    expect(plural('ru', 2, weeks)).toBe('2 недели');
    expect(plural('ru', 5, weeks)).toBe('5 недель');
    expect(plural('ru', 1, days)).toBe('1 день');
    expect(plural('ru', 22, days)).toBe('22 дня');
    expect(plural('ru', 11, days)).toBe('11 дней');
  });

  it('fractional weeks', () => {
    expect(plural('ru', 0.5, weeks)).toBe('0,5 недели');
    expect(plural('en', 0.5, en.plural.week)).toBe('0.5 weeks');
  });
});

describe('English plurals', () => {
  it('one and other', () => {
    expect(plural('en', 1, en.plural.week)).toBe('1 week');
    expect(plural('en', 2, en.plural.week)).toBe('2 weeks');
  });
});

describe('helpers', () => {
  it('t() looks up dotted keys and fills placeholders', () => {
    expect(t('en', 'site.name')).toBe('AI Engineer Quest');
    expect(fill('Hi {name}!', { name: 'Hero' })).toBe('Hi Hero!');
  });

  it('dictionaries have the same keys', () => {
    const keys = (o: object, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === 'object' && !Array.isArray(v) && !('other' in v) ? keys(v, `${p}${k}.`) : [`${p}${k}`],
      );
    expect(keys(getDict('ru'))).toEqual(keys(getDict('en')));
  });

  it('switchLangPath keeps the page', () => {
    expect(switchLangPath('/en/level/2', 'ru')).toBe('/ru/level/2');
    expect(switchLangPath('/ru/', 'en')).toBe('/en/');
    expect(switchLangPath('/ru', 'en')).toBe('/en/');
    expect(switchLangPath('/whatever', 'ru')).toBe('/ru/');
  });

  it('pickLang: saved choice, then browser, then en', () => {
    expect(pickLang('ru', ['en-US'])).toBe('ru');
    expect(pickLang(null, ['ru-RU', 'en'])).toBe('ru');
    expect(pickLang(null, ['de-DE'])).toBe('en');
    expect(pickLang('xx', ['en-GB'])).toBe('en');
  });
});
