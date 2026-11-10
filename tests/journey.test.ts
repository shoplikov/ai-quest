import { describe, expect, it } from 'vitest';
import {
  BREAKS,
  BREAK_RESULT,
  STATIONS,
  STEPS,
  STEP_COUNT,
  activeConnectors,
  clampStep,
  direction,
  failingStation,
} from '../src/lib/journey';

describe('request journey steps', () => {
  it('has eight steps through six stations', () => {
    expect(STATIONS).toEqual(['browser', 'dns', 'firewall', 'nginx', 'app', 'db']);
    expect(STEP_COUNT).toBe(8);
  });

  it('goes out to the database and back to the browser', () => {
    expect(STEPS.map((s) => s.station)).toEqual([0, 1, 2, 3, 4, 5, 0, null]);
    expect(direction(STEPS[5]!)).toBe('forward');
    expect(direction(STEPS[6]!)).toBe('back');
    expect(direction(STEPS[0]!)).toBeNull();
  });

  it('lights the connectors between from and to', () => {
    expect(activeConnectors(STEPS[0]!)).toEqual([]);
    expect(activeConnectors(STEPS[2]!)).toEqual([0, 1]);
    expect(activeConnectors(STEPS[3]!)).toEqual([2]);
    expect(activeConnectors(STEPS[6]!)).toEqual([0, 1, 2, 3]);
  });

  it('clamps the step index', () => {
    expect(clampStep(-1)).toBe(0);
    expect(clampStep(99)).toBe(7);
  });
});

describe('where would it break', () => {
  it.each([
    ['dns', 'dns', 'Could not resolve host'],
    ['firewall', 'firewall', 'timed out'],
    ['nginx', 'nginx', 'Connection refused'],
    ['app', 'app', '502 Bad Gateway'],
    ['db', 'db', '500 Internal Server Error'],
  ] as const)('%s fails at %s with %s', (id, station, error) => {
    expect(BREAK_RESULT[id].station).toBe(station);
    expect(BREAK_RESULT[id].error).toContain(error);
    expect(failingStation(id)).toBe(STATIONS.indexOf(station));
  });

  it('has exactly five breaks', () => {
    expect(BREAKS).toHaveLength(5);
  });
});
