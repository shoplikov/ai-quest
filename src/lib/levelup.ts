// Opens the level-up screen (components/fun/LevelUp.astro).
export function showLevelUp(dialog: HTMLDialogElement, xp: number, verdict: string): void {
  const line = dialog.querySelector<HTMLElement>('[data-badge-line]');
  if (line) line.textContent = verdict;
  dialog.showModal();

  // The XP number counts up.
  const xpEl = dialog.querySelector<HTMLElement>('[data-levelup-xp]');
  if (!xpEl) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    xpEl.textContent = String(xp);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - start - 400) / 800);
    xpEl.textContent = String(Math.round(xp * (1 - (1 - Math.max(0, k)) ** 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
