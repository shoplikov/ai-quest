import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, clampPort, commandsFor, evaluatePort, type PortConfig } from '../src/lib/ports';

const machine = (over: Partial<PortConfig> = {}): PortConfig => ({ ...DEFAULT_CONFIG, runsIn: 'machine', ...over });
const docker = (over: Partial<PortConfig> = {}): PortConfig => ({
  ...DEFAULT_CONFIG,
  runsIn: 'docker',
  appAddress: '0.0.0.0',
  appPort: 8000,
  publish: { hostIp: null, hostPort: 8080, containerPort: 8000 },
  callerPort: 8080,
  ...over,
});

describe('app on the machine', () => {
  it('rule 1: outsider + closed firewall → timeout at the firewall', () => {
    const r = evaluatePort(machine({ caller: 'other', firewallOpen: false, appAddress: '0.0.0.0' }));
    expect(r).toMatchObject({ ok: false, stopAt: 'firewall', rule: 'firewall', error: 'curl: (28) Connection timed out' });
  });

  it('rule 2: caller port ≠ app port → refused at the host port', () => {
    const r = evaluatePort(machine({ callerPort: 8001 }));
    expect(r).toMatchObject({ ok: false, stopAt: 'host-port', rule: 'wrong-port' });
    expect(r.error).toBe('curl: (7) Failed to connect to localhost port 8001 after 0 ms: Connection refused');
  });

  it('rule 3: outsider + app on 127.0.0.1 → refused', () => {
    const r = evaluatePort(machine({ caller: 'other', appAddress: '127.0.0.1' }));
    expect(r).toMatchObject({ ok: false, stopAt: 'host-port', rule: 'localhost-only' });
    expect(r.error).toContain('192.168.1.20 port 8000');
    expect(r.error).toContain('Connection refused');
  });

  it('rule 4: success — same machine, right port', () => {
    expect(evaluatePort(machine())).toEqual({ ok: true, stopAt: null, rule: 'ok', error: null });
  });

  it('success from another machine with 0.0.0.0 and an open firewall', () => {
    expect(evaluatePort(machine({ caller: 'other', appAddress: '0.0.0.0' })).ok).toBe(true);
  });

  it('the firewall does not matter for callers on the same machine', () => {
    expect(evaluatePort(machine({ firewallOpen: false })).ok).toBe(true);
  });
});

describe('app in a Docker container', () => {
  it('rule 1: outsider + closed firewall → timeout', () => {
    expect(evaluatePort(docker({ caller: 'other', firewallOpen: false }))).toMatchObject({
      stopAt: 'firewall',
      rule: 'firewall',
      error: 'curl: (28) Connection timed out',
    });
  });

  it('rule 2: no published port → refused', () => {
    expect(evaluatePort(docker({ publish: null }))).toMatchObject({ stopAt: 'host-port', rule: 'no-publish' });
  });

  it('rule 3: caller port ≠ HOST port → refused', () => {
    const r = evaluatePort(docker({ callerPort: 8000 }));
    expect(r).toMatchObject({ stopAt: 'host-port', rule: 'wrong-host-port' });
    expect(r.error).toContain('Connection refused');
  });

  it('rule 4: published on 127.0.0.1 + outsider → refused', () => {
    const r = evaluatePort(docker({ caller: 'other', publish: { hostIp: '127.0.0.1', hostPort: 8080, containerPort: 8000 } }));
    expect(r).toMatchObject({ stopAt: 'host-port', rule: 'publish-local-only' });
  });

  it('rule 4 does not apply to callers on the same machine', () => {
    expect(evaluatePort(docker({ publish: { hostIp: '127.0.0.1', hostPort: 8080, containerPort: 8000 } })).ok).toBe(true);
  });

  it('rule 5: CONTAINER port ≠ app port → connection reset at publish', () => {
    expect(evaluatePort(docker({ publish: { hostIp: null, hostPort: 8080, containerPort: 9000 } }))).toEqual({
      ok: false,
      stopAt: 'publish',
      rule: 'container-port-mismatch',
      error: 'curl: (56) Recv failure: Connection reset by peer',
    });
  });

  it('rule 6: app on 127.0.0.1 inside the container → connection reset', () => {
    expect(evaluatePort(docker({ appAddress: '127.0.0.1' }))).toEqual({
      ok: false,
      stopAt: 'container-app',
      rule: 'container-localhost',
      error: 'curl: (56) Recv failure: Connection reset by peer',
    });
  });

  it('rule 7: success — published, right ports, 0.0.0.0', () => {
    expect(evaluatePort(docker())).toEqual({ ok: true, stopAt: null, rule: 'ok', error: null });
    expect(evaluatePort(docker({ caller: 'other' })).ok).toBe(true);
  });

  it('rules are checked in order: firewall before everything else', () => {
    const r = evaluatePort(docker({ caller: 'other', firewallOpen: false, publish: null, appAddress: '127.0.0.1' }));
    expect(r.rule).toBe('firewall');
  });
});

describe('commands', () => {
  it('machine mode', () => {
    expect(commandsFor(machine({ appAddress: '0.0.0.0', caller: 'other' }))).toEqual([
      'uvicorn app:app --host 0.0.0.0 --port 8000',
      'curl http://192.168.1.20:8000',
    ]);
  });
  it('docker mode with and without -p and host IP', () => {
    expect(commandsFor(docker({ caller: 'other' }))).toEqual([
      'uvicorn app:app --host 0.0.0.0 --port 8000',
      'docker run -p 8080:8000 my-app',
      'curl http://192.168.1.20:8080',
    ]);
    expect(commandsFor(docker({ publish: { hostIp: '127.0.0.1', hostPort: 8080, containerPort: 8000 } }))[1]).toBe(
      'docker run -p 127.0.0.1:8080:8000 my-app',
    );
    expect(commandsFor(docker({ publish: null }))[1]).toBe('docker run my-app');
  });
  it('clamps ports', () => {
    expect(clampPort(0, 8000)).toBe(1);
    expect(clampPort(70000, 8000)).toBe(65535);
    expect(clampPort(Number.NaN, 8000)).toBe(8000);
  });
});
