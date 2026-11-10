// Progress model and derived values. Pure functions only — no DOM here.
// The browser wrappers (localStorage, events) live in ./store.ts.

export const STORAGE_KEY = 'aiquest:v1';
export const LEVEL_IDS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
export const LEVEL_COUNT = LEVEL_IDS.length;
/** Current level value meaning "all levels done, the boss is next". */
export const BOSS = LEVEL_COUNT + 1;
export const QUIZ_LENGTH = 5;
export const HERO_MAX = 24;
export const BOSS_ITEMS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'r9', 'r10', 'r11', 'r12'] as const;

export type DeliverableId = 'repo' | 'sketch' | 'demo';
export const DELIVERABLES: readonly DeliverableId[] = ['repo', 'sketch', 'demo'];
export type SkillRating = 0 | 1 | 2 | 3;
export type Theme = 'light' | 'dark';

export type LevelProgress = {
  missions: string[];
  breaks: string[];
  deliverable: DeliverableId[];
  selfCheck: number[];
  quizBest: number;
  doneAt?: string;
};

export type Progress = {
  v: 1;
  hero: string;
  startedAt: string;
  levels: Record<string, LevelProgress>;
  boss: { items: string[]; doneAt?: string };
  skills: Record<string, SkillRating>;
  days: string[];
  theme?: Theme;
};

// ---------- creation ----------

export function emptyLevel(): LevelProgress {
  return { missions: [], breaks: [], deliverable: [], selfCheck: [], quizBest: 0 };
}

export function emptyProgress(now: Date = new Date()): Progress {
  return {
    v: 1,
    hero: '',
    startedAt: now.toISOString(),
    levels: {},
    boss: { items: [] },
    skills: {},
    days: [],
  };
}

export function level(p: Progress, id: string | number): LevelProgress {
  return p.levels[String(id)] ?? emptyLevel();
}

export function cleanHero(name: string): string {
  return Array.from(name.replace(/\s+/g, ' ').trim()).slice(0, HERO_MAX).join('').trim();
}

// ---------- validation ----------

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const isStrArr = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === 'string');
const isIntArr = (x: unknown): x is number[] =>
  Array.isArray(x) && x.every((n) => Number.isInteger(n) && (n as number) >= 0);
const isDate = (x: unknown): x is string => typeof x === 'string' && !Number.isNaN(Date.parse(x));
const isDay = (x: unknown): boolean => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x);

function validLevel(x: unknown): x is LevelProgress {
  if (!isObj(x)) return false;
  return (
    isStrArr(x.missions) &&
    isStrArr(x.breaks) &&
    isStrArr(x.deliverable) &&
    (x.deliverable as string[]).every((d) => (DELIVERABLES as readonly string[]).includes(d)) &&
    isIntArr(x.selfCheck) &&
    Number.isInteger(x.quizBest) &&
    (x.quizBest as number) >= 0 &&
    (x.quizBest as number) <= 50 &&
    (x.doneAt === undefined || isDate(x.doneAt))
  );
}

/** Returns a clean Progress, or null if the data has the wrong shape or version. */
export function validateProgress(x: unknown): Progress | null {
  if (!isObj(x) || x.v !== 1) return null;
  if (typeof x.hero !== 'string' || !isDate(x.startedAt)) return null;
  if (!isObj(x.levels) || !isObj(x.boss) || !isObj(x.skills) || !Array.isArray(x.days)) return null;
  for (const [k, v] of Object.entries(x.levels)) {
    if (!(LEVEL_IDS as readonly string[]).includes(k) || !validLevel(v)) return null;
  }
  if (!isStrArr(x.boss.items)) return null;
  if (x.boss.doneAt !== undefined && !isDate(x.boss.doneAt)) return null;
  for (const [k, v] of Object.entries(x.skills)) {
    if (!(LEVEL_IDS as readonly string[]).includes(k) || ![0, 1, 2, 3].includes(v as number)) return null;
  }
  if (!x.days.every(isDay)) return null;
  if (x.theme !== undefined && x.theme !== 'light' && x.theme !== 'dark') return null;

  const levels: Record<string, LevelProgress> = {};
  for (const [k, v] of Object.entries(x.levels as Record<string, LevelProgress>)) {
    levels[k] = {
      missions: [...new Set(v.missions)],
      breaks: [...new Set(v.breaks)],
      deliverable: [...new Set(v.deliverable)],
      selfCheck: [...new Set(v.selfCheck)],
      quizBest: v.quizBest,
      ...(v.doneAt ? { doneAt: v.doneAt } : {}),
    };
  }
  const boss = x.boss as Progress['boss'];
  return {
    v: 1,
    hero: cleanHero(x.hero),
    startedAt: x.startedAt,
    levels,
    boss: { items: [...new Set(boss.items)], ...(boss.doneAt ? { doneAt: boss.doneAt } : {}) },
    skills: { ...(x.skills as Record<string, SkillRating>) },
    days: [...new Set(x.days as string[])].sort(),
    ...(x.theme ? { theme: x.theme as Theme } : {}),
  };
}

/** Parse stored JSON; null if missing or broken. */
export function parseProgress(raw: string | null): Progress | null {
  if (!raw) return null;
  try {
    return validateProgress(JSON.parse(raw));
  } catch {
    return null;
  }
}

// ---------- days ----------

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number);
  return dayKey(new Date(y!, m! - 1, d! + delta));
}

export function markDay(p: Progress, today: string): Progress {
  return p.days.includes(today) ? p : { ...p, days: [...p.days, today].sort() };
}

export type Streak = { days: number; broken: boolean };

/** Consecutive days ending today or yesterday. `broken` means there was
 *  activity before, but the chain has ended. */
export function streak(days: readonly string[], today: string): Streak {
  const set = new Set(days);
  let start: string | null = null;
  if (set.has(today)) start = today;
  else if (set.has(shiftDay(today, -1))) start = shiftDay(today, -1);
  if (!start) return { days: 0, broken: days.length > 0 };
  let count = 0;
  let cur = start;
  while (set.has(cur)) {
    count++;
    cur = shiftDay(cur, -1);
  }
  return { days: count, broken: false };
}

// ---------- level state ----------

/** Lowest level without doneAt (1..8); BOSS (9) when all are done. */
export function currentLevel(p: Progress): number {
  for (const id of LEVEL_IDS) {
    if (!p.levels[id]?.doneAt) return Number(id);
  }
  return BOSS;
}

export type NodeState = 'done' | 'current' | 'ahead';

export function levelState(p: Progress, id: number): NodeState {
  if (p.levels[String(id)]?.doneAt) return 'done';
  return id === currentLevel(p) ? 'current' : 'ahead';
}

/** Ticking is allowed on done levels and the current one, not ahead. */
export function canTick(p: Progress, id: number): boolean {
  return levelState(p, id) !== 'ahead';
}

export function canFinish(lp: LevelProgress, missionIds: readonly string[]): boolean {
  return (
    !lp.doneAt &&
    missionIds.every((m) => lp.missions.includes(m)) &&
    DELIVERABLES.every((d) => lp.deliverable.includes(d))
  );
}

// ---------- XP, rank, badges ----------

export const XP = { mission: 20, break: 15, selfCheck: 5, quizPoint: 10, level: 100, boss: 500 } as const;

export function xp(p: Progress): number {
  let total = 0;
  for (const lp of Object.values(p.levels)) {
    total += lp.missions.length * XP.mission;
    total += lp.breaks.length * XP.break;
    total += lp.selfCheck.length * XP.selfCheck;
    total += lp.quizBest * XP.quizPoint;
    if (lp.doneAt) total += XP.level;
  }
  if (p.boss.doneAt) total += XP.boss;
  return total;
}

export const RANKS = [0, 300, 800, 1500, 2400, 3200] as const;

/** Index into RANKS (and into the rank title list in the dictionary). */
export function rankIndex(points: number): number {
  let idx = 0;
  RANKS.forEach((min, i) => {
    if (points >= min) idx = i;
  });
  return idx;
}

export type RankInfo = { index: number; min: number; next: number | null; fraction: number };

export function rankInfo(points: number): RankInfo {
  const index = rankIndex(points);
  const min = RANKS[index]!;
  const next = index + 1 < RANKS.length ? RANKS[index + 1]! : null;
  const fraction = next === null ? 1 : (points - min) / (next - min);
  return { index, min, next, fraction };
}

export type BadgeId = `level-${number}` | 'first-step' | 'chaos-gremlin' | 'quiz-wizard' | 'quest-complete';

export function hasAnyTick(p: Progress): boolean {
  return (
    p.days.length > 0 ||
    p.boss.items.length > 0 ||
    Object.values(p.levels).some(
      (lp) => lp.missions.length + lp.breaks.length + lp.deliverable.length + lp.selfCheck.length > 0,
    )
  );
}

export function badges(p: Progress): BadgeId[] {
  const out: BadgeId[] = [];
  if (hasAnyTick(p)) out.push('first-step');
  for (const id of LEVEL_IDS) {
    if (p.levels[id]?.doneAt) out.push(`level-${id}` as BadgeId);
  }
  const breaks = Object.values(p.levels).reduce((n, lp) => n + lp.breaks.length, 0);
  if (breaks >= 10) out.push('chaos-gremlin');
  const fullQuizzes = Object.values(p.levels).filter((lp) => lp.quizBest >= QUIZ_LENGTH).length;
  if (fullQuizzes >= 4) out.push('quiz-wizard');
  if (p.boss.doneAt) out.push('quest-complete');
  return out;
}

// ---------- updates (all return a new object) ----------

type ListKey = 'missions' | 'breaks';

function withLevel(p: Progress, id: string | number, fn: (lp: LevelProgress) => LevelProgress): Progress {
  return { ...p, levels: { ...p.levels, [String(id)]: fn(level(p, id)) } };
}

function toggleIn<T>(list: readonly T[], item: T, on: boolean): T[] {
  const has = list.includes(item);
  if (on && !has) return [...list, item];
  if (!on && has) return list.filter((x) => x !== item);
  return [...list];
}

export type TickKind = 'mission' | 'break' | 'deliverable' | 'selfCheck';

export function setTick(
  p: Progress,
  levelId: string | number,
  kind: TickKind,
  item: string | number,
  on: boolean,
  today: string,
): Progress {
  const next = withLevel(p, levelId, (lp) => {
    switch (kind) {
      case 'mission':
      case 'break': {
        const key: ListKey = kind === 'mission' ? 'missions' : 'breaks';
        return { ...lp, [key]: toggleIn(lp[key], String(item), on) };
      }
      case 'deliverable':
        return { ...lp, deliverable: toggleIn(lp.deliverable, item as DeliverableId, on) };
      case 'selfCheck':
        return { ...lp, selfCheck: toggleIn(lp.selfCheck, Number(item), on) };
    }
  });
  return on ? markDay(next, today) : next;
}

export function isTicked(p: Progress, levelId: string | number, kind: TickKind, item: string | number): boolean {
  const lp = level(p, levelId);
  switch (kind) {
    case 'mission':
      return lp.missions.includes(String(item));
    case 'break':
      return lp.breaks.includes(String(item));
    case 'deliverable':
      return lp.deliverable.includes(item as DeliverableId);
    case 'selfCheck':
      return lp.selfCheck.includes(Number(item));
  }
}

export function recordQuiz(p: Progress, levelId: string | number, score: number): Progress {
  const lp = level(p, levelId);
  if (score <= lp.quizBest) return p;
  return withLevel(p, levelId, (l) => ({ ...l, quizBest: score }));
}

export function finishLevel(p: Progress, levelId: string | number, now: Date): Progress {
  const lp = level(p, levelId);
  if (lp.doneAt) return p;
  return markDay(withLevel(p, levelId, (l) => ({ ...l, doneAt: now.toISOString() })), dayKey(now));
}

export function setBossItem(p: Progress, item: string, on: boolean, today: string): Progress {
  const next = { ...p, boss: { ...p.boss, items: toggleIn(p.boss.items, item, on) } };
  return on ? markDay(next, today) : next;
}

export function finishBoss(p: Progress, now: Date): Progress {
  if (p.boss.doneAt) return p;
  return markDay({ ...p, boss: { ...p.boss, doneAt: now.toISOString() } }, dayKey(now));
}

export function setSkill(p: Progress, levelId: string | number, rating: SkillRating): Progress {
  return { ...p, skills: { ...p.skills, [String(levelId)]: rating } };
}

/** First unticked mission of the current level, if any. */
export function nextMission(p: Progress, missionIds: readonly string[], levelId: number): string | null {
  const lp = level(p, levelId);
  return missionIds.find((m) => !lp.missions.includes(m)) ?? null;
}

// ---------- share link ----------

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Progress → JSON → UTF-8 → base64url. The theme is a device setting, not shared. */
export function encodeShare(p: Progress): string {
  const { theme: _theme, ...shared } = p;
  return toBase64Url(new TextEncoder().encode(JSON.stringify(shared)));
}

/** Returns null for anything that is not valid share data. */
export function decodeShare(data: string): Progress | null {
  if (!data || !/^[A-Za-z0-9_-]+$/.test(data)) return null;
  try {
    const json = new TextDecoder('utf-8', { fatal: true }).decode(fromBase64Url(data));
    return validateProgress(JSON.parse(json));
  } catch {
    return null;
  }
}

export function shareUrl(origin: string, lang: string, p: Progress): string {
  return `${origin}/${lang}/#p=${encodeShare(p)}`;
}

/** Reads `#p=…` from a location hash. undefined = no share data present. */
export function shareFromHash(hash: string): string | undefined {
  const m = hash.match(/^#p=(.*)$/);
  return m ? m[1] : undefined;
}
