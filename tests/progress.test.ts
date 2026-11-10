import { describe, expect, it } from 'vitest';
import {
  BOSS,
  badges,
  canFinish,
  canTick,
  currentLevel,
  decodeShare,
  emptyLevel,
  emptyProgress,
  encodeShare,
  finishBoss,
  finishLevel,
  levelState,
  nextMission,
  parseProgress,
  rankIndex,
  rankInfo,
  recordQuiz,
  setTick,
  shareFromHash,
  streak,
  validateProgress,
  xp,
  type Progress,
} from '../src/lib/progress';

const NOW = new Date('2026-11-10T12:00:00Z');
const base = (): Progress => emptyProgress(NOW);

function withLevels(levels: Progress['levels']): Progress {
  return { ...base(), hero: 'Hero', levels };
}

describe('XP', () => {
  it('is 0 for a new hero', () => {
    expect(xp(base())).toBe(0);
  });

  it('counts every kind of tick with the right weight', () => {
    const p = withLevels({
      '2': {
        missions: ['m1', 'm2'], // 40
        breaks: ['b1'], // 15
        deliverable: ['repo', 'sketch', 'demo'], // 0 on their own
        selfCheck: [0, 1, 2], // 15
        quizBest: 4, // 40
        doneAt: NOW.toISOString(), // 100
      },
    });
    expect(xp(p)).toBe(40 + 15 + 15 + 40 + 100);
  });

  it('adds 500 for the boss', () => {
    expect(xp(finishBoss(base(), NOW))).toBe(500);
  });
});

describe('rank thresholds', () => {
  it.each([
    [0, 0],
    [299, 0],
    [300, 1],
    [799, 1],
    [800, 2],
    [1500, 3],
    [2400, 4],
    [3199, 4],
    [3200, 5],
    [99999, 5],
  ])('%i XP → rank %i', (points, rank) => {
    expect(rankIndex(points)).toBe(rank);
  });

  it('knows the next rank and the fraction towards it', () => {
    expect(rankInfo(550)).toEqual({ index: 1, min: 300, next: 800, fraction: 0.5 });
    expect(rankInfo(4000).next).toBeNull();
    expect(rankInfo(4000).fraction).toBe(1);
  });
});

describe('streak', () => {
  const today = '2026-11-10';
  it('counts consecutive days ending today', () => {
    expect(streak(['2026-11-08', '2026-11-09', '2026-11-10'], today)).toEqual({ days: 3, broken: false });
  });
  it('counts consecutive days ending yesterday', () => {
    expect(streak(['2026-11-07', '2026-11-08', '2026-11-09'], today)).toEqual({ days: 3, broken: false });
  });
  it('stops at a gap', () => {
    expect(streak(['2026-11-05', '2026-11-09', '2026-11-10'], today)).toEqual({ days: 2, broken: false });
  });
  it('is broken when the last day is older than yesterday', () => {
    expect(streak(['2026-11-01', '2026-11-02'], today)).toEqual({ days: 0, broken: true });
  });
  it('is not "broken" for someone who never ticked anything', () => {
    expect(streak([], today)).toEqual({ days: 0, broken: false });
  });
  it('works across a month boundary', () => {
    expect(streak(['2026-10-31', '2026-11-01'], '2026-11-01')).toEqual({ days: 2, broken: false });
  });
});

describe('current level', () => {
  it('starts at level 1', () => {
    expect(currentLevel(base())).toBe(1);
  });
  it('is the lowest level without doneAt', () => {
    const p = withLevels({
      '1': { ...emptyLevel(), doneAt: NOW.toISOString() },
      '3': { ...emptyLevel(), doneAt: NOW.toISOString() },
    });
    expect(currentLevel(p)).toBe(2);
    expect(levelState(p, 1)).toBe('done');
    expect(levelState(p, 2)).toBe('current');
    expect(levelState(p, 3)).toBe('done');
    expect(levelState(p, 4)).toBe('ahead');
  });
  it('is the boss after level 8', () => {
    let p = base();
    for (let i = 1; i <= 8; i++) p = finishLevel(p, i, NOW);
    expect(currentLevel(p)).toBe(BOSS);
  });
  it('allows ticking on done and current levels, not ahead', () => {
    const p = withLevels({ '1': { ...emptyLevel(), doneAt: NOW.toISOString() } });
    expect(canTick(p, 1)).toBe(true);
    expect(canTick(p, 2)).toBe(true);
    expect(canTick(p, 3)).toBe(false);
  });
});

describe('ticks and finishing', () => {
  it('ticking marks today as an active day; unticking removes the item', () => {
    let p = setTick(base(), 2, 'mission', 'm1', true, '2026-11-10');
    expect(p.levels['2']!.missions).toEqual(['m1']);
    expect(p.days).toEqual(['2026-11-10']);
    p = setTick(p, 2, 'mission', 'm1', false, '2026-11-10');
    expect(p.levels['2']!.missions).toEqual([]);
  });
  it('does not duplicate ids', () => {
    let p = setTick(base(), 2, 'break', 'b1', true, '2026-11-10');
    p = setTick(p, 2, 'break', 'b1', true, '2026-11-10');
    expect(p.levels['2']!.breaks).toEqual(['b1']);
  });
  it('can finish only with all missions and all three deliverables', () => {
    const missions = ['m1', 'm2'];
    let p = base();
    for (const m of missions) p = setTick(p, 2, 'mission', m, true, '2026-11-10');
    expect(canFinish(p.levels['2']!, missions)).toBe(false);
    for (const d of ['repo', 'sketch', 'demo']) p = setTick(p, 2, 'deliverable', d, true, '2026-11-10');
    expect(canFinish(p.levels['2']!, missions)).toBe(true);
    p = finishLevel(p, 2, NOW);
    expect(canFinish(p.levels['2']!, missions)).toBe(false);
  });
  it('keeps only the best quiz score', () => {
    let p = recordQuiz(base(), 2, 3);
    p = recordQuiz(p, 2, 1);
    expect(p.levels['2']!.quizBest).toBe(3);
    p = recordQuiz(p, 2, 5);
    expect(p.levels['2']!.quizBest).toBe(5);
  });
  it('finds the first unticked mission', () => {
    const p = setTick(base(), 1, 'mission', 'm1', true, '2026-11-10');
    expect(nextMission(p, ['m1', 'm2', 'm3'], 1)).toBe('m2');
    expect(nextMission(p, ['m1'], 1)).toBeNull();
  });
});

describe('badges', () => {
  it('none for a new hero', () => {
    expect(badges(base())).toEqual([]);
  });
  it('First Step after the first tick', () => {
    expect(badges(setTick(base(), 1, 'selfCheck', 0, true, '2026-11-10'))).toContain('first-step');
  });
  it('one badge per finished level', () => {
    const p = finishLevel(finishLevel(base(), 1, NOW), 2, NOW);
    expect(badges(p)).toEqual(expect.arrayContaining(['level-1', 'level-2']));
    expect(badges(p)).not.toContain('level-3');
  });
  it('Chaos Gremlin at 10 breaks across levels', () => {
    const lv = (n: number) => ({ ...emptyLevel(), breaks: Array.from({ length: n }, (_, i) => `b${i + 1}`) });
    expect(badges(withLevels({ '1': lv(4), '2': lv(4) }))).not.toContain('chaos-gremlin');
    expect(badges(withLevels({ '1': lv(4), '2': lv(4), '3': lv(2) }))).toContain('chaos-gremlin');
  });
  it('Quiz Wizard at full score on 4 quizzes', () => {
    const full = { ...emptyLevel(), quizBest: 5 };
    const three = withLevels({ '1': full, '2': full, '3': full, '4': { ...emptyLevel(), quizBest: 4 } });
    expect(badges(three)).not.toContain('quiz-wizard');
    expect(badges(withLevels({ '1': full, '2': full, '3': full, '4': full }))).toContain('quiz-wizard');
  });
  it('Quest Complete when the boss is done', () => {
    expect(badges(finishBoss(base(), NOW))).toContain('quest-complete');
  });
});

describe('share link', () => {
  const sample = (): Progress => {
    let p: Progress = { ...base(), hero: 'Ада Лавлейс 🚀', theme: 'dark' };
    p = setTick(p, 2, 'mission', 'm1', true, '2026-11-10');
    p = recordQuiz(p, 2, 4);
    p = finishLevel(p, 1, NOW);
    return { ...p, skills: { '1': 2, '2': 3 } };
  };

  it('round-trips, including non-Latin names and emoji', () => {
    const p = sample();
    const data = encodeShare(p);
    expect(data).toMatch(/^[A-Za-z0-9_-]+$/);
    const { theme: _t, ...expected } = p;
    expect(decodeShare(data)).toEqual(expected);
  });

  it('reads the data from a hash', () => {
    expect(shareFromHash('#p=abc')).toBe('abc');
    expect(shareFromHash('#missions')).toBeUndefined();
  });

  it.each([
    ['empty', ''],
    ['not base64url', '***'],
    ['random bytes', 'aGVsbG8gd29ybGQ'],
    ['truncated', encodeShare(emptyProgress(NOW)).slice(0, 20)],
  ])('rejects broken data: %s', (_name, data) => {
    expect(decodeShare(data)).toBeNull();
  });

  it('rejects the wrong version or shape', () => {
    const enc = (o: unknown) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeShare(enc({ ...base(), v: 2 }))).toBeNull();
    expect(decodeShare(enc({ ...base(), levels: { '9': emptyLevel() } }))).toBeNull();
    expect(decodeShare(enc({ ...base(), levels: { '1': { ...emptyLevel(), quizBest: -1 } } }))).toBeNull();
    expect(decodeShare(enc({ ...base(), skills: { '1': 7 } }))).toBeNull();
    expect(decodeShare(enc({ ...base(), days: ['yesterday'] }))).toBeNull();
    expect(decodeShare(enc([1, 2, 3]))).toBeNull();
  });
});

describe('stored data', () => {
  it('parses what was saved, and ignores garbage', () => {
    const p = base();
    expect(parseProgress(JSON.stringify(p))).toEqual(p);
    expect(parseProgress('{not json')).toBeNull();
    expect(parseProgress(null)).toBeNull();
    expect(validateProgress({ v: 1 })).toBeNull();
  });
  it('cuts the hero name to 24 characters', () => {
    const p = validateProgress({ ...base(), hero: 'x'.repeat(40) });
    expect(p?.hero).toHaveLength(24);
  });
});
