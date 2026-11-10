// Update a ProgressRing rendered by ProgressRing.astro.
export function setRing(el: HTMLElement, fraction: number): void {
  const pct = Math.round(Math.max(0, Math.min(1, fraction)) * 100);
  const fill = el.querySelector<SVGCircleElement>('.ring-fill');
  const text = el.querySelector<HTMLElement>('[data-ring-text]');
  const c = Number(fill?.dataset.c ?? 0);
  fill?.setAttribute('stroke-dashoffset', String(c * (1 - pct / 100)));
  if (text) text.textContent = `${pct}%`;
  el.setAttribute('aria-label', `${el.dataset.label ?? ''}: ${pct}%`);
}
