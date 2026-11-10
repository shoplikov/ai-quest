// Small browser wrappers around ./progress.ts: storage, view mode, events.
// Every storage access is wrapped in try/catch; without storage the site
// keeps progress in memory for this page.
import {
  STORAGE_KEY,
  decodeShare,
  emptyProgress,
  parseProgress,
  shareFromHash,
  type Progress,
} from './progress';

const VIEW_KEY = 'aiquest:view';
const CHANGE_EVENT = 'aiquest:change';

type State = {
  own: Progress | null;
  view: Progress | null;
  storageOk: boolean;
  shareBroken: boolean;
  ready: boolean;
};

// One state per page, kept on window so every bundle shares it.
declare global {
  interface Window {
    __aiquest?: State;
  }
}

function state(): State {
  if (!window.__aiquest) window.__aiquest = init();
  return window.__aiquest;
}

function storageWorks(): boolean {
  try {
    const k = '__aiquest_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function readSession(): string | null {
  try {
    return sessionStorage.getItem(VIEW_KEY);
  } catch {
    return null;
  }
}

function writeSession(value: string | null): void {
  try {
    if (value === null) sessionStorage.removeItem(VIEW_KEY);
    else sessionStorage.setItem(VIEW_KEY, value);
  } catch {
    /* view mode then lasts for this page only */
  }
}

function init(): State {
  const storageOk = storageWorks();
  let own: Progress | null = null;
  if (storageOk) {
    try {
      own = parseProgress(localStorage.getItem(STORAGE_KEY));
    } catch {
      own = null;
    }
  }

  let view: Progress | null = null;
  let shareBroken = false;
  const fromHash = shareFromHash(location.hash);
  if (fromHash !== undefined) {
    const decoded = decodeShare(fromHash);
    if (decoded) {
      view = decoded;
      writeSession(fromHash);
    } else {
      shareBroken = true;
    }
    // Clean the hash so a reload does not re-trigger, and the URL stays short.
    history.replaceState(null, '', location.pathname + location.search);
  } else {
    const saved = readSession();
    if (saved) view = decodeShare(saved);
  }

  const s: State = { own, view, storageOk, shareBroken, ready: true };

  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    s.own = parseProgress(e.newValue);
    emit();
  });

  return s;
}

function emit(): void {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

// ---------- public API ----------

/** The progress to show: the shared one in view mode, otherwise our own. */
export function getProgress(): Progress {
  const s = state();
  return s.view ?? s.own ?? emptyProgress();
}

/** Our own progress, never the viewed one. */
export function getOwnProgress(): Progress {
  return state().own ?? emptyProgress();
}

/** True once the welcome card was answered (the hero name is saved then;
 *  an empty answer saves the default name). */
export function hasStarted(): boolean {
  return (state().own?.hero ?? '') !== '';
}

export function isViewMode(): boolean {
  return state().view !== null;
}

export function storageAvailable(): boolean {
  return state().storageOk;
}

export function shareLinkBroken(): boolean {
  return state().shareBroken;
}

export function exitViewMode(): void {
  const s = state();
  s.view = null;
  writeSession(null);
  emit();
}

function save(p: Progress): void {
  const s = state();
  s.own = p;
  if (s.storageOk) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {
      s.storageOk = false;
    }
  }
  emit();
}

/** Change our own progress. Does nothing in view mode. Returns the new value. */
export function updateProgress(fn: (p: Progress) => Progress): Progress | null {
  if (isViewMode()) return null;
  const next = fn(getOwnProgress());
  save(next);
  return next;
}

export function resetProgress(): void {
  const s = state();
  const theme = s.own?.theme;
  s.own = null;
  if (s.storageOk) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  if (theme) document.documentElement.removeAttribute('data-theme');
  emit();
}

/** Call fn on every change (this tab or another). Returns an unsubscribe. */
export function subscribe(fn: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, fn);
  return () => window.removeEventListener(CHANGE_EVENT, fn);
}
