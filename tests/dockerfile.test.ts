import { describe, expect, it } from 'vitest';
import { GOOD_ORDER, START_ORDER, moveLine, simulateBuild, type LineId } from '../src/lib/dockerfile';

const statuses = (order: LineId[], change: Parameters<typeof simulateBuild>[1]) =>
  simulateBuild(order, change).lines.map((l) => l.status);

describe('dockerfile layer stacker: cache', () => {
  it('starts with the bad order: COPY . . above pip install', () => {
    expect(START_ORDER.indexOf('copyAll')).toBeLessThan(START_ORDER.indexOf('runPip'));
    expect(GOOD_ORDER).toEqual(['from', 'workdir', 'copyReq', 'runPip', 'copyAll', 'cmd']);
  });

  it('good order + app.py change: only the code layer rebuilds, about 1s', () => {
    const r = simulateBuild(GOOD_ORDER, 'app');
    expect(r.lines.map((l) => l.status)).toEqual(['cached', 'cached', 'cached', 'cached', 'rebuilt', 'rebuilt']);
    expect(r.total).toBe(1);
    expect(r.verdict).toBe('good');
    expect(r.error).toBeNull();
  });

  it('bad order + app.py change: every package reinstalls, 46s', () => {
    const r = simulateBuild(START_ORDER, 'app');
    expect(r.total).toBe(46);
    expect(r.verdict).toBe('bad');
    expect(r.lines.find((l) => l.id === 'runPip')!.status).toBe('rebuilt');
  });

  it('requirements change rebuilds from COPY requirements.txt down', () => {
    expect(statuses(GOOD_ORDER, 'requirements')).toEqual(['cached', 'cached', 'rebuilt', 'rebuilt', 'rebuilt', 'rebuilt']);
    const r = simulateBuild(GOOD_ORDER, 'requirements');
    expect(r.total).toBe(46);
    expect(r.verdict).toBe('requirements');
  });

  it('nothing changed: everything cached, 0s', () => {
    const r = simulateBuild(START_ORDER, 'none');
    expect(r.lines.every((l) => l.status === 'cached')).toBe(true);
    expect(r.total).toBe(0);
    expect(r.verdict).toBe('nothing');
  });

  it('a rebuilt line rebuilds every line after it, and only those cost time', () => {
    const r = simulateBuild(['from', 'copyAll', 'workdir', 'copyReq', 'runPip', 'cmd'], 'app');
    expect(r.lines.map((l) => l.status)).toEqual(['cached', 'rebuilt', 'rebuilt', 'rebuilt', 'rebuilt', 'rebuilt']);
    expect(r.lines.map((l) => l.seconds)).toEqual([0, 1, 0, 0, 45, 0]);
    expect(r.total).toBe(46);
  });
});

describe('dockerfile layer stacker: validity', () => {
  it('FROM must be first', () => {
    const r = simulateBuild(['workdir', 'from', 'copyReq', 'runPip', 'copyAll', 'cmd'], 'app');
    expect(r.error).toBe('fromFirst');
    expect(r.lines.find((l) => l.id === 'from')!.status).toBe('error');
    expect(r.lines.filter((l) => l.status === 'skipped')).toHaveLength(5);
    expect(r.total).toBe(0);
    expect(r.verdict).toBeNull();
  });

  it('pip before any COPY that brings requirements.txt is an error', () => {
    const r = simulateBuild(['from', 'workdir', 'runPip', 'copyReq', 'copyAll', 'cmd'], 'app');
    expect(r.error).toBe('pipBeforeCopy');
    expect(r.lines.map((l) => l.status)).toEqual(['cached', 'cached', 'error', 'skipped', 'skipped', 'skipped']);
  });

  it('COPY . . also brings in requirements.txt', () => {
    const r = simulateBuild(['from', 'workdir', 'copyAll', 'runPip', 'copyReq', 'cmd'], 'none');
    expect(r.error).toBeNull();
  });
});

describe('moving lines', () => {
  it('moves a line up and down and stays in bounds', () => {
    expect(moveLine(GOOD_ORDER, 4, -1).slice(3, 5)).toEqual(['copyAll', 'runPip']);
    expect(moveLine(GOOD_ORDER, 0, -1)).toEqual(GOOD_ORDER);
    expect(moveLine(GOOD_ORDER, 5, 1)).toEqual(GOOD_ORDER);
    expect(moveLine(GOOD_ORDER, 0, 3)).toEqual(['workdir', 'copyReq', 'runPip', 'from', 'copyAll', 'cmd']);
  });
});
