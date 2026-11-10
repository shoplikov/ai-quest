// Port playground logic (docs/spec/widgets.md §1). Pure: returns codes and
// the real curl output; the view maps rule codes to text in each language.

export const MACHINE_IP = '192.168.1.20';

export type PortConfig = {
  runsIn: 'machine' | 'docker';
  appAddress: '127.0.0.1' | '0.0.0.0';
  appPort: number;
  /** Docker only. null = no -p at all. */
  publish: { hostIp: '127.0.0.1' | null; hostPort: number; containerPort: number } | null;
  caller: 'same' | 'other';
  callerPort: number;
  firewallOpen: boolean;
};

export type StopAt = 'firewall' | 'host-port' | 'publish' | 'container-app' | 'app' | null;

export type RuleId =
  | 'firewall'
  | 'wrong-port'
  | 'localhost-only'
  | 'no-publish'
  | 'wrong-host-port'
  | 'publish-local-only'
  | 'container-port-mismatch'
  | 'container-localhost'
  | 'ok';

export type PortResult = {
  ok: boolean;
  stopAt: StopAt;
  rule: RuleId;
  /** Exact curl output (never translated), or null on success. */
  error: string | null;
};

export const DEFAULT_CONFIG: PortConfig = {
  runsIn: 'machine',
  appAddress: '127.0.0.1',
  appPort: 8000,
  publish: { hostIp: null, hostPort: 8080, containerPort: 8000 },
  caller: 'same',
  callerPort: 8000,
  firewallOpen: true,
};

export function callerHost(c: PortConfig): string {
  return c.caller === 'same' ? 'localhost' : MACHINE_IP;
}

const TIMEOUT = 'curl: (28) Connection timed out';
const RESET = 'curl: (56) Recv failure: Connection reset by peer';
const refused = (c: PortConfig) =>
  `curl: (7) Failed to connect to ${callerHost(c)} port ${c.callerPort} after 0 ms: Connection refused`;

const fail = (rule: RuleId, stopAt: StopAt, error: string): PortResult => ({ ok: false, stopAt, rule, error });
const OK: PortResult = { ok: true, stopAt: null, rule: 'ok', error: null };

/** Evaluate the rules in the spec's order and return the first match. */
export function evaluatePort(c: PortConfig): PortResult {
  const outsider = c.caller === 'other';

  if (outsider && !c.firewallOpen) return fail('firewall', 'firewall', TIMEOUT);

  if (c.runsIn === 'machine') {
    if (c.callerPort !== c.appPort) return fail('wrong-port', 'host-port', refused(c));
    if (outsider && c.appAddress === '127.0.0.1') return fail('localhost-only', 'host-port', refused(c));
    return OK;
  }

  const p = c.publish;
  if (!p) return fail('no-publish', 'host-port', refused(c));
  if (c.callerPort !== p.hostPort) return fail('wrong-host-port', 'host-port', refused(c));
  if (p.hostIp === '127.0.0.1' && outsider) return fail('publish-local-only', 'host-port', refused(c));
  if (p.containerPort !== c.appPort) return fail('container-port-mismatch', 'publish', RESET);
  if (c.appAddress === '127.0.0.1') return fail('container-localhost', 'container-app', RESET);
  return OK;
}

/** The commands that match the config, shown live under the controls. */
export function commandsFor(c: PortConfig): string[] {
  const out = [`uvicorn app:app --host ${c.appAddress} --port ${c.appPort}`];
  if (c.runsIn === 'docker') {
    const p = c.publish;
    const flag = p ? ` -p ${p.hostIp ? `${p.hostIp}:` : ''}${p.hostPort}:${p.containerPort}` : '';
    out.push(`docker run${flag} my-app`);
  }
  out.push(`curl http://${callerHost(c)}:${c.callerPort}`);
  return out;
}

/** Keep a typed port inside 1..65535. */
export function clampPort(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(65535, Math.max(1, Math.round(value)));
}
