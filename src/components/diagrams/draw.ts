// Drawing helpers for the hand-drawn diagrams: slightly uneven rounded
// boxes and arrows with open heads. Deterministic (seeded), so the
// server output never changes between builds.

function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const f = (n: number) => n.toFixed(1);

/** A rounded rectangle whose sides wobble a little, like a pen drawing. */
export function roughRect(x: number, y: number, w: number, h: number, seed = 1, r = 10): string {
  const rand = rng(seed + Math.round(x * 7 + y * 13 + w));
  const j = () => (rand() - 0.5) * 2.4;
  const x2 = x + w;
  const y2 = y + h;
  return [
    `M${f(x + r)} ${f(y + j())}`,
    `Q${f(x + w / 2)} ${f(y + j() * 1.4)} ${f(x2 - r)} ${f(y + j())}`,
    `Q${f(x2)} ${f(y)} ${f(x2 + j())} ${f(y + r)}`,
    `Q${f(x2 + j() * 1.4)} ${f(y + h / 2)} ${f(x2 + j())} ${f(y2 - r)}`,
    `Q${f(x2)} ${f(y2)} ${f(x2 - r)} ${f(y2 + j())}`,
    `Q${f(x + w / 2)} ${f(y2 + j() * 1.4)} ${f(x + r)} ${f(y2 + j())}`,
    `Q${f(x)} ${f(y2)} ${f(x + j())} ${f(y2 - r)}`,
    `Q${f(x + j() * 1.4)} ${f(y + h / 2)} ${f(x + j())} ${f(y + r)}`,
    `Q${f(x)} ${f(y)} ${f(x + r)} ${f(y + j())}Z`,
  ].join(' ');
}

/** A gently curved line from (x1, y1) to (x2, y2), bending by `bend` px. */
export function curve(x1: number, y1: number, x2: number, y2: number, bend = 0): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bend;
  const cy = my + (dx / len) * bend;
  return `M${f(x1)} ${f(y1)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}`;
}

/** Open arrow head at (x2, y2), pointing away from the control direction. */
export function arrowHead(x1: number, y1: number, x2: number, y2: number, bend = 0, size = 11): string {
  // Direction of the curve at its end: from the control point to the end.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bend;
  const cy = my + (dx / len) * bend;
  const a = Math.atan2(y2 - cy, x2 - cx);
  const p1 = [x2 - size * Math.cos(a - 0.45), y2 - size * Math.sin(a - 0.45)];
  const p2 = [x2 - size * Math.cos(a + 0.45), y2 - size * Math.sin(a + 0.45)];
  return `M${f(p1[0]!)} ${f(p1[1]!)} L${f(x2)} ${f(y2)} L${f(p2[0]!)} ${f(p2[1]!)}`;
}

/** Split a label on "\n" for <tspan> lines. */
export function lines(text: string): string[] {
  return text.split('\n');
}
