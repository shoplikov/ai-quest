// Small canvas confetti: 120 pieces in palette colours, 1.8 s, then the
// canvas removes itself. With reduced motion: a static sparkle instead.
import { iconSvg } from './icons';

const COLORS = ['#FF6B5E', '#1FA89A', '#FFC53D', '#8E7CF0', '#4AA8FF', '#F06292'];

export function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function confetti(opts: { pieces?: number; duration?: number } = {}): void {
  if (prefersReducedMotion()) {
    sparkle();
    return;
  }
  const pieces = opts.pieces ?? 120;
  const duration = opts.duration ?? 1800;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '100',
  });
  document.body.append(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);

  const parts = Array.from({ length: pieces }, () => ({
    x: w / 2 + (Math.random() - 0.5) * w * 0.3,
    y: h * 0.35,
    vx: (Math.random() - 0.5) * 14,
    vy: -Math.random() * 14 - 4,
    size: 6 + Math.random() * 6,
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    round: Math.random() < 0.3,
  }));

  const start = performance.now();
  const frame = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, w, h);
    const fade = t > duration - 400 ? Math.max(0, (duration - t) / 400) : 1;
    ctx.globalAlpha = fade;
    for (const p of parts) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    }
    if (t < duration) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}

/** Static sparkle for reduced motion: appears, stays a moment, disappears. */
export function sparkle(): void {
  const el = document.createElement('div');
  el.className = 'sparkle';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = iconSvg('star', 96);
  document.body.append(el);
  setTimeout(() => el.remove(), 1800);
}
