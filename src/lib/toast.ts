// Small bottom-centre messages ("+20 XP", "Link copied").
export function toast(message: string, ms = 2200): void {
  const area = document.querySelector<HTMLElement>('.toast-area');
  if (!area) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  area.append(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 300);
  }, ms);
}
