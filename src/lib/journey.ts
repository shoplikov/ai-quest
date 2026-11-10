// Request journey logic (docs/spec/widgets.md §2). Pure data and helpers;
// the view maps station and break codes to text.

export const STATIONS = ['browser', 'dns', 'firewall', 'nginx', 'app', 'db'] as const;
export type Station = (typeof STATIONS)[number];

export type Step = {
  /** Highlighted station (index into STATIONS), or null for the summary. */
  station: number | null;
  /** The request travels from → to on this step (null = no arrow). */
  from: number | null;
  to: number | null;
};

// Steps 1–8 from the spec, in order.
export const STEPS: readonly Step[] = [
  { station: 0, from: null, to: null }, // 1 Browser asks
  { station: 1, from: 0, to: 1 }, // 2 DNS answers
  { station: 2, from: 0, to: 2 }, // 3 knock on 443, firewall lets in
  { station: 3, from: 2, to: 3 }, // 4 nginx passes to the app
  { station: 4, from: 3, to: 4 }, // 5 app asks the database
  { station: 5, from: 4, to: 5 }, // 6 database answers
  { station: 0, from: 4, to: 0 }, // 7 back to the browser
  { station: null, from: null, to: null }, // 8 summary
];

export const STEP_COUNT = STEPS.length;

/** Connector i joins station i and i+1. Which connectors the step lights up. */
export function activeConnectors(step: Step): number[] {
  if (step.from === null || step.to === null) return [];
  const lo = Math.min(step.from, step.to);
  const hi = Math.max(step.from, step.to);
  const out: number[] = [];
  for (let i = lo; i < hi; i++) out.push(i);
  return out;
}

export function direction(step: Step): 'forward' | 'back' | null {
  if (step.from === null || step.to === null) return null;
  return step.to > step.from ? 'forward' : 'back';
}

export function clampStep(i: number): number {
  return Math.max(0, Math.min(STEP_COUNT - 1, i));
}

export const BREAKS = ['dns', 'firewall', 'nginx', 'app', 'db'] as const;
export type BreakId = (typeof BREAKS)[number];

/** Which station fails and what the user sees (real text, never translated). */
export const BREAK_RESULT: Record<BreakId, { station: Station; error: string }> = {
  dns: { station: 'dns', error: 'Could not resolve host: quest.example.com' },
  firewall: { station: 'firewall', error: 'Connection timed out' },
  nginx: { station: 'nginx', error: 'Connection refused' },
  app: { station: 'app', error: '502 Bad Gateway' },
  db: { station: 'db', error: '500 Internal Server Error' },
};

export function failingStation(id: BreakId): number {
  return STATIONS.indexOf(BREAK_RESULT[id].station);
}
