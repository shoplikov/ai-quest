// The silly layer: Porto the buddy, secret achievements, console greeting.
// Browser only. Nothing here changes lesson progress or XP.
import { fill } from '../i18n';
import { confetti } from './confetti';
import { addSecret, bumpStat, type SecretId, type StatKey } from './progress';
import { getOwnProgress, hasStarted, isViewMode, updateProgress } from './store';
import { toast } from './toast';

export type FunData = {
  lines: Record<'poke' | 'idle' | 'fastScroll' | 'night' | 'console', string[]>;
  secrets: Record<SecretId, { name: string; how: string }>;
  t: Record<'secretToast' | 'hush' | 'unhush' | 'hushed' | 'unhushed', string>;
};

const HUSH_KEY = 'aiquest:hush';
const GAP_MS = 120_000; // at most one unprompted remark per two minutes
const IDLE_MS = 90_000;
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

let data: FunData | null = null;
let lastRemark = 0;
let bubbleTimer = 0;

const pick = (list: readonly string[]) => list[Math.floor(Math.random() * list.length)]!;
const el = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel);

function hushed(): boolean {
  try {
    return localStorage.getItem(HUSH_KEY) === '1';
  } catch {
    return false;
  }
}

/** Porto says a line in his bubble. */
export function say(text: string, ms = 6500): void {
  const bubble = el('[data-buddy-bubble]');
  if (!bubble || hushed()) return;
  bubble.textContent = text;
  bubble.hidden = false;
  requestAnimationFrame(() => bubble.classList.add('is-in'));
  clearTimeout(bubbleTimer);
  bubbleTimer = window.setTimeout(() => {
    bubble.classList.remove('is-in');
    window.setTimeout(() => (bubble.hidden = true), 300);
  }, ms);
}

/** An unprompted remark, rate-limited. */
function remark(pool: 'idle' | 'fastScroll' | 'night'): void {
  if (!data || document.hidden) return;
  const now = Date.now();
  if (now - lastRemark < GAP_MS) return;
  lastRemark = now;
  say(pick(data.lines[pool]));
}

function announce(id: SecretId): void {
  if (!data) return;
  toast(fill(data.t.secretToast, { name: data.secrets[id].name }), 4200);
  confetti({ pieces: 60, duration: 1400 });
  say(data.secrets[id].how, 8000);
}

const canSave = () => hasStarted() && !isViewMode();

/** Unlock a secret achievement (once). */
export function award(id: SecretId): void {
  if (!canSave() || getOwnProgress().secrets?.includes(id)) return;
  updateProgress((p) => addSecret(p, id));
  announce(id);
}

/** Count something; the matching secret unlocks at its goal. */
export function count(key: StatKey): void {
  if (!canSave()) return;
  const before = getOwnProgress().secrets ?? [];
  const next = updateProgress((p) => bumpStat(p, key));
  const found = (next?.secrets ?? []).find((s) => !before.includes(s));
  if (found) announce(found);
}

export function initFun(d: FunData): void {
  data = d;
  const buddy = el('[data-buddy]');
  const btn = el<HTMLButtonElement>('[data-buddy-btn]');
  const hushBtn = el<HTMLButtonElement>('[data-hush]');

  const applyHush = () => {
    const off = hushed();
    if (buddy) buddy.hidden = off;
    if (hushBtn) hushBtn.textContent = off ? d.t.unhush : d.t.hush;
  };
  applyHush();
  hushBtn?.addEventListener('click', () => {
    const off = !hushed();
    try {
      localStorage.setItem(HUSH_KEY, off ? '1' : '0');
    } catch {
      /* stays for this page only */
    }
    applyHush();
    toast(off ? d.t.hushed : d.t.unhushed, 3200);
  });

  // Poke.
  btn?.addEventListener('click', () => {
    btn.classList.remove('is-poked');
    void btn.offsetWidth;
    btn.classList.add('is-poked');
    say(pick(d.lines.poke), 4500);
    count('pokes');
  });

  // Idle.
  let idle = window.setTimeout(() => remark('idle'), IDLE_MS);
  const awake = () => {
    clearTimeout(idle);
    idle = window.setTimeout(() => remark('idle'), IDLE_MS);
  };
  for (const name of ['pointerdown', 'keydown', 'scroll'] as const) addEventListener(name, awake, { passive: true });

  // Very fast scrolling.
  let lastY = scrollY;
  let lastT = performance.now();
  addEventListener(
    'scroll',
    () => {
      const now = performance.now();
      if (now - lastT < 250) return;
      const speed = Math.abs(scrollY - lastY) / (now - lastT); // px per ms
      lastY = scrollY;
      lastT = now;
      if (speed > 9) remark('fastScroll');
    },
    { passive: true },
  );

  // Night visit.
  if (new Date().getHours() < 5) {
    award('night-owl');
    let told = false;
    try {
      told = sessionStorage.getItem('aiquest:night') === '1';
      sessionStorage.setItem('aiquest:night', '1');
    } catch {
      /* fine */
    }
    if (!told) window.setTimeout(() => say(pick(d.lines.night)), 1500);
  }

  // Konami code.
  let pos = 0;
  addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === KONAMI[pos] ? pos + 1 : key === KONAMI[0] ? 1 : 0;
    if (pos === KONAMI.length) {
      pos = 0;
      confetti({ pieces: 200, duration: 2600 });
      award('old-school');
    }
  });

  // Theme switched five times within eight seconds.
  let flips: number[] = [];
  document.addEventListener('click', (e) => {
    if (!(e.target as Element).closest('[data-theme-toggle]')) return;
    const now = Date.now();
    flips = [...flips.filter((t) => now - t < 8000), now];
    if (flips.length >= 5) award('indecisive');
  });

  // Printing a cheat sheet.
  addEventListener('beforeprint', () => {
    if (location.pathname.includes('/cheatsheets/')) award('paper-person');
  });

  // Events from widgets and cards.
  document.addEventListener('quest:quiz-miss', () => count('quizMisses'));
  document.addEventListener('quest:excuse', () => count('excuses'));

  // A greeting for people who open DevTools.
  const otter = ['    .-"""-.', "   /  o o  \\", '   |   ᴥ   |   ' + d.lines.console[0], "    \\ '-' /    " + d.lines.console[1], "     '---'      " + d.lines.console[2]];
  console.log('%c' + otter.join('\n'), 'font-family: monospace; color: #b5794a');
}
