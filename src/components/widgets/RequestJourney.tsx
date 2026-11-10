// Request journey (docs/spec/widgets.md §2). Steps and breaks live in
// src/lib/journey.ts; this file draws them. Text comes in through `strings`.
import { useEffect, useState } from 'preact/hooks';
import { fill, type Dict } from '../../i18n';
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
  type BreakId,
} from '../../lib/journey';

type Strings = Dict['widgets']['requestJourney'];
type Props = { strings: Strings };

const PLAY_MS = 1600;
let uid = 0;

export default function RequestJourney({ strings: t }: Props) {
  const [id] = useState(() => `rj${++uid}`);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [broken, setBroken] = useState<BreakId | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEP_COUNT - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => clampStep(s + 1)), PLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, step]);

  const s = STEPS[step]!;
  const lit = new Set(activeConnectors(s));
  const dir = direction(s);
  const failAt = broken ? failingStation(broken) : null;
  const summary = s.station === null;

  return (
    <section class="widget request-journey" id="widget-request-journey" data-anchor aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} class="widget-title">{t.title}</h3>
      <p class="widget-instruction">{t.instruction}</p>
      <div class="widget-try">
        <p class="widget-label">{t.tryTitle}</p>
        <ul>
          {t.tries.map((x) => (
            <li>{x}</li>
          ))}
        </ul>
      </div>

      <ol class="rj-stations" aria-label={t.title}>
        {STATIONS.map((_, i) => {
          const active = !broken && s.station === i;
          const failed = failAt === i;
          const passed = failAt !== null && i < failAt;
          return (
            <li
              class={[
                'rj-station',
                active && 'is-active',
                failed && 'is-failed',
                passed && 'is-passed',
                summary && !broken && 'is-summary',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={active ? 'step' : undefined}
            >
              <span class="rj-icon" aria-hidden="true">
                {t.icons[i]}
              </span>
              <span class="rj-name">{t.stations[i]}</span>
              {active && <span class="rj-dot" aria-hidden="true" />}
              {i < STATIONS.length - 1 && (
                <span
                  class={[
                    'rj-link',
                    !broken && lit.has(i) && 'is-lit',
                    !broken && lit.has(i) && dir === 'back' && 'is-back',
                    passed && 'is-passed',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {broken ? (
        <div class="rj-caption is-bad" aria-live="polite">
          <p class="widget-label">{t.userSees}</p>
          <pre class="widget-pre">
            <code>{BREAK_RESULT[broken].error}</code>
          </pre>
          <p>{t.breaks[broken].reason}</p>
        </div>
      ) : (
        <div class={`rj-caption${summary ? ' is-summary' : ''}`} aria-live="polite">
          <p class="rj-step-of">{fill(t.stepOf, { n: step + 1, total: STEP_COUNT })}</p>
          {t.captions[step]!.map((line) => (
            <p class="rj-line">{line}</p>
          ))}
        </div>
      )}

      <div class="rj-controls">
        <button type="button" class="btn btn-ghost btn-small" onClick={() => { setPlaying(false); setBroken(null); setStep((x) => clampStep(x - 1)); }} disabled={step === 0 && !broken}>
          ← {t.back}
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-small"
          aria-pressed={playing}
          onClick={() => {
            setBroken(null);
            if (!playing && step === STEP_COUNT - 1) setStep(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? `❚❚ ${t.pause}` : `▶ ${t.play}`}
        </button>
        <button type="button" class="btn btn-primary btn-small" onClick={() => { setPlaying(false); setBroken(null); setStep((x) => clampStep(x + 1)); }} disabled={step === STEP_COUNT - 1 && !broken}>
          {t.next} →
        </button>
        <button type="button" class="btn btn-ghost btn-small" onClick={() => { setPlaying(false); setBroken(null); setStep(0); }}>
          ↺ {t.restart}
        </button>
      </div>

      <div class="rj-breaks">
        <p class="rj-break-title">{t.breakTitle}</p>
        <p class="rj-break-intro">{t.breakIntro}</p>
        <div class="rj-break-buttons">
          {BREAKS.map((b) => (
            <button
              type="button"
              class={`btn btn-small ${broken === b ? 'btn-primary' : 'btn-ghost'}`}
              aria-pressed={broken === b}
              onClick={() => {
                setPlaying(false);
                setBroken(broken === b ? null : b);
              }}
            >
              {t.breaks[b].label}
            </button>
          ))}
          {broken && (
            <button type="button" class="btn btn-success btn-small" onClick={() => setBroken(null)}>
              {t.clear}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
