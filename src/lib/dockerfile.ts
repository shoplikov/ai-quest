// Dockerfile layer stacker (docs/spec/widgets.md §3). Pure logic: the view
// maps line ids, statuses, errors and verdicts to text.

export type LineId = 'from' | 'workdir' | 'copyReq' | 'runPip' | 'copyAll' | 'cmd';
export type Change = 'app' | 'requirements' | 'none';
/** `skipped`: the build stopped at an error before this line ran. */
export type LineStatus = 'cached' | 'rebuilt' | 'error' | 'skipped';
export type BuildError = 'fromFirst' | 'pipBeforeCopy';
export type Verdict = 'good' | 'bad' | 'requirements' | 'nothing';

/** The Dockerfile text of each line. Code, so never translated. */
export const LINE_TEXT: Record<LineId, string> = {
  from: 'FROM python:3.12-slim',
  workdir: 'WORKDIR /app',
  copyReq: 'COPY requirements.txt .',
  runPip: 'RUN pip install -r requirements.txt',
  copyAll: 'COPY . .',
  cmd: 'CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]',
};

/** Seconds each line takes when it is rebuilt. */
export const COST: Record<LineId, number> = { from: 8, workdir: 0, copyReq: 0, runPip: 45, copyAll: 1, cmd: 0 };

export const GOOD_ORDER: LineId[] = ['from', 'workdir', 'copyReq', 'runPip', 'copyAll', 'cmd'];
/** The widget starts with the bad order, so she gets to fix it. */
export const START_ORDER: LineId[] = ['from', 'workdir', 'copyAll', 'copyReq', 'runPip', 'cmd'];

/** Which lines see a changed input in each scenario. */
const CHANGED: Record<Change, ReadonlySet<LineId>> = {
  app: new Set(['copyAll']),
  requirements: new Set(['copyReq', 'copyAll']),
  none: new Set(),
};

/** Lines that bring requirements.txt into the image. */
const BRINGS_REQUIREMENTS: ReadonlySet<LineId> = new Set(['copyReq', 'copyAll']);

export type BuildResult = {
  lines: { id: LineId; status: LineStatus; seconds: number }[];
  total: number;
  error: BuildError | null;
  verdict: Verdict | null;
};

export function simulateBuild(order: readonly LineId[], change: Change): BuildResult {
  // FROM first: otherwise the build never starts.
  if (order[0] !== 'from') {
    return {
      lines: order.map((id) => ({ id, status: id === 'from' ? 'error' : 'skipped', seconds: 0 })),
      total: 0,
      error: 'fromFirst',
      verdict: null,
    };
  }

  const lines: BuildResult['lines'] = [];
  let rebuilding = false;
  let haveRequirements = false;
  let error: BuildError | null = null;

  for (const id of order) {
    if (error) {
      lines.push({ id, status: 'skipped', seconds: 0 });
      continue;
    }
    if (id === 'runPip' && !haveRequirements) {
      error = 'pipBeforeCopy';
      lines.push({ id, status: 'error', seconds: 0 });
      continue;
    }
    if (BRINGS_REQUIREMENTS.has(id)) haveRequirements = true;
    if (CHANGED[change].has(id)) rebuilding = true;
    lines.push(rebuilding ? { id, status: 'rebuilt', seconds: COST[id] } : { id, status: 'cached', seconds: 0 });
  }

  const total = lines.reduce((n, l) => n + l.seconds, 0);
  return { lines, total, error, verdict: error ? null : verdictFor(lines, change) };
}

function verdictFor(lines: BuildResult['lines'], change: Change): Verdict {
  if (change === 'none') return 'nothing';
  if (change === 'requirements') return 'requirements';
  return lines.find((l) => l.id === 'runPip')!.status === 'rebuilt' ? 'bad' : 'good';
}

/** Move the line at `index` by `delta` places, clamped to the list. */
export function moveLine<T>(order: readonly T[], index: number, delta: number): T[] {
  const to = Math.min(order.length - 1, Math.max(0, index + delta));
  if (to === index || index < 0 || index >= order.length) return [...order];
  const next = [...order];
  const [item] = next.splice(index, 1);
  next.splice(to, 0, item!);
  return next;
}
