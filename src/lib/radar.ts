// Geometry of the skills radar chart, used by the page (server) and its
// script (client) so both draw the same shape.
export const RADAR = { width: 460, height: 400, radius: 128, max: 3 } as const;

/** Point for axis `i` of `n` at rating `value` (0..max). Axis 0 points up. */
export function radarPoint(i: number, n: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
  const r = (RADAR.radius * value) / RADAR.max;
  const round = (x: number) => Math.round(x * 10) / 10;
  return [round(RADAR.width / 2 + r * Math.cos(angle)), round(RADAR.height / 2 + r * Math.sin(angle))];
}
