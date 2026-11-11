// Theme: the `data-theme` attribute on <html>, saved in progress.
import { updateProgress } from './store';

export type Theme = 'light' | 'dark';

export function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme | undefined): void {
  if (theme) document.documentElement.setAttribute('data-theme', theme);
  else document.documentElement.removeAttribute('data-theme');
}

export function setTheme(theme: Theme): void {
  // Colours switch in one step: with transitions on, every element would
  // fade at its own speed and the page would smear.
  const off = document.createElement('style');
  off.textContent = '*,*::before,*::after{transition:none !important}';
  document.head.append(off);
  applyTheme(theme);
  void document.body.offsetHeight;
  requestAnimationFrame(() => requestAnimationFrame(() => off.remove()));
  // In view mode nothing is written, so the change lasts for this page only.
  updateProgress((p) => ({ ...p, theme }));
}
