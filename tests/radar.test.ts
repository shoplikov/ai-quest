import { describe, expect, it } from 'vitest';
import { RADAR, radarPoint } from '../src/lib/radar';

describe('radarPoint', () => {
  const cx = RADAR.width / 2;
  const cy = RADAR.height / 2;

  it('puts a rating of 0 in the centre', () => {
    expect(radarPoint(3, 8, 0)).toEqual([cx, cy]);
  });

  it('points axis 0 straight up at full radius', () => {
    expect(radarPoint(0, 8, 3)).toEqual([cx, cy - RADAR.radius]);
  });

  it('goes clockwise: axis 2 of 8 points right', () => {
    expect(radarPoint(2, 8, 3)).toEqual([cx + RADAR.radius, cy]);
  });

  it('scales with the rating', () => {
    const [, y1] = radarPoint(0, 8, 1);
    expect(cy - y1).toBeCloseTo(RADAR.radius / 3, 1);
  });
});
