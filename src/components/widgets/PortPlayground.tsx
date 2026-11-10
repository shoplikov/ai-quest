// Port playground (docs/spec/widgets.md §1). Logic lives in src/lib/ports.ts;
// this file only draws it. All text comes in through `strings`.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { Dict } from '../../i18n';
import {
  DEFAULT_CONFIG,
  clampPort,
  commandsFor,
  evaluatePort,
  type PortConfig,
  type StopAt,
} from '../../lib/ports';
import { Inline } from './Inline';

type Strings = Dict['widgets']['portPlayground'];
type Props = { strings: Strings };

let uid = 0;

function Segmented<T extends string>(props: {
  name: string;
  legend: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset class="seg" disabled={props.disabled}>
      <legend>{props.legend}</legend>
      <div class="seg-options">
        {props.options.map((o) => (
          <label class={`seg-opt${props.value === o.value ? ' is-on' : ''}`}>
            <input
              type="radio"
              name={props.name}
              value={o.value}
              checked={props.value === o.value}
              onChange={() => props.onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PortInput(props: { id: string; label: string; value: number; onChange: (n: number) => void; disabled?: boolean }) {
  const [text, setText] = useState(String(props.value));
  useEffect(() => setText(String(props.value)), [props.value]);
  return (
    <div class="num-field">
      <label for={props.id}>{props.label}</label>
      <input
        id={props.id}
        class="num-input"
        type="number"
        inputMode="numeric"
        min={1}
        max={65535}
        value={text}
        disabled={props.disabled}
        onInput={(e) => {
          const v = (e.currentTarget as HTMLInputElement).value;
          setText(v);
          const n = Number(v);
          if (v !== '' && Number.isInteger(n) && n >= 1 && n <= 65535) props.onChange(n);
        }}
        onBlur={() => {
          const n = clampPort(Number(text), props.value);
          setText(String(n));
          props.onChange(n);
        }}
      />
    </div>
  );
}

// Picture geometry (viewBox 640 × 230).
const Y = 128;
function stopX(stop: StopAt, docker: boolean): number {
  switch (stop) {
    case 'firewall':
      return 158;
    case 'host-port':
      return 300;
    case 'publish':
      return 404;
    case 'container-app':
      return 440;
    case 'app':
      return docker ? 440 : 334;
    default:
      return docker ? 466 : 358;
  }
}

export default function PortPlayground({ strings: t }: Props) {
  const [c, setC] = useState<PortConfig>(DEFAULT_CONFIG);
  const [id] = useState(() => `pp${++uid}`);
  const result = useMemo(() => evaluatePort(c), [c]);
  const commands = useMemo(() => commandsFor(c), [c]);
  const set = (patch: Partial<PortConfig>) => setC((prev) => ({ ...prev, ...patch }));
  const docker = c.runsIn === 'docker';
  const outsider = c.caller === 'other';

  // The dot starts at the caller and travels to where it stops.
  const startX = outsider ? 64 : 222;
  const endX = stopX(result.stopAt, docker);
  const [dotX, setDotX] = useState(endX);
  const picture = useRef<HTMLElement>(null);
  useEffect(() => {
    // On narrow screens the picture scrolls: keep the stop point in view.
    const fig = picture.current;
    if (fig && fig.scrollWidth > fig.clientWidth) {
      const scale = fig.scrollWidth / 640;
      fig.scrollTo({ left: Math.max(0, endX * scale - fig.clientWidth / 2) });
    }
    setDotX(startX);
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setDotX(endX)));
    return () => cancelAnimationFrame(r);
  }, [startX, endX, result.rule]);

  const rule = t.rules[result.rule];
  const publishLabel = c.publish
    ? `-p ${c.publish.hostIp ? `${c.publish.hostIp}:` : ''}${c.publish.hostPort}:${c.publish.containerPort}`
    : '—';

  return (
    <section class="widget port-playground" id="widget-port-playground" data-anchor aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} class="widget-title">{t.title}</h3>
      <p class="widget-instruction">{t.instruction}</p>
      <div class="widget-try">
        <p class="widget-label">{t.tryTitle}</p>
        <ul>
          {t.tries.map((x) => (
            <li>
              <Inline text={x} />
            </li>
          ))}
        </ul>
      </div>

      <div class="pp-controls">
        <Segmented
          name={`${id}-runs`}
          legend={t.runsIn}
          value={c.runsIn}
          options={[
            { value: 'machine', label: t.onMachine },
            { value: 'docker', label: t.inDocker },
          ]}
          onChange={(runsIn) => set({ runsIn })}
        />
        <Segmented
          name={`${id}-addr`}
          legend={t.appAddress}
          value={c.appAddress}
          options={[
            { value: '127.0.0.1', label: '127.0.0.1' },
            { value: '0.0.0.0', label: '0.0.0.0' },
          ]}
          onChange={(appAddress) => set({ appAddress })}
        />
        <PortInput id={`${id}-appport`} label={t.appPort} value={c.appPort} onChange={(appPort) => set({ appPort })} />

        {docker && (
          <fieldset class="seg pp-publish">
            <legend>{t.publish}</legend>
            <div class="seg-options">
              <label class={`seg-opt${c.publish ? '' : ' is-on'}`}>
                <input type="radio" name={`${id}-pub`} checked={!c.publish} onChange={() => set({ publish: null })} />
                <span>{t.publishNone}</span>
              </label>
              <label class={`seg-opt${c.publish ? ' is-on' : ''}`}>
                <input
                  type="radio"
                  name={`${id}-pub`}
                  checked={!!c.publish}
                  onChange={() => set({ publish: { hostIp: null, hostPort: 8080, containerPort: 8000 } })}
                />
                <span class="mono">{t.publishOn}</span>
              </label>
            </div>
            {c.publish && (
              <div class="pp-publish-fields">
                <PortInput
                  id={`${id}-host`}
                  label={t.hostPort}
                  value={c.publish.hostPort}
                  onChange={(hostPort) => set({ publish: { ...c.publish!, hostPort } })}
                />
                <PortInput
                  id={`${id}-cont`}
                  label={t.containerPort}
                  value={c.publish.containerPort}
                  onChange={(containerPort) => set({ publish: { ...c.publish!, containerPort } })}
                />
                <label class="check-inline">
                  <input
                    type="checkbox"
                    checked={c.publish.hostIp === '127.0.0.1'}
                    onChange={(e) =>
                      set({ publish: { ...c.publish!, hostIp: (e.currentTarget as HTMLInputElement).checked ? '127.0.0.1' : null } })
                    }
                  />
                  <span>{t.hostIpOnly}</span>
                </label>
              </div>
            )}
          </fieldset>
        )}

        <Segmented
          name={`${id}-caller`}
          legend={t.caller}
          value={c.caller}
          options={[
            { value: 'same', label: t.callerSame },
            { value: 'other', label: t.callerOther },
          ]}
          onChange={(caller) => set({ caller })}
        />
        <PortInput id={`${id}-callport`} label={t.callerPort} value={c.callerPort} onChange={(callerPort) => set({ callerPort })} />
        <Segmented
          name={`${id}-fw`}
          legend={t.firewall}
          value={c.firewallOpen ? 'yes' : 'no'}
          options={[
            { value: 'yes', label: t.yes },
            { value: 'no', label: t.no },
          ]}
          onChange={(v) => set({ firewallOpen: v === 'yes' })}
        />
      </div>

      <div class="pp-commands">
        <p class="widget-label">{t.commands}</p>
        <pre class="widget-pre">
          <code>{commands.join('\n')}</code>
        </pre>
      </div>

      <figure class="pp-picture" ref={picture}>
        <svg viewBox="0 0 640 230" role="img" aria-label={t.pictureTitle}>
          {/* machine */}
          <rect x="160" y="34" width="468" height="176" rx="14" class="pp-machine" />
          <text x="394" y="58" class="pp-label" text-anchor="middle">{t.machine}</text>
          {/* firewall */}
          <g class={`pp-firewall ${c.firewallOpen ? 'is-open' : 'is-closed'}`}>
            <path d={`M160 ${Y - 40} V${Y + 40}`} />
            <text x="160" y="226" text-anchor="middle" class="pp-small">{t.firewallLabel}</text>
          </g>
          {/* caller */}
          {outsider ? (
            <g class="pp-caller">
              <rect x="20" y={Y - 26} width="92" height="44" rx="6" />
              <path d={`M10 ${Y + 24} h112`} />
              <text x="66" y={Y + 46} text-anchor="middle" class="pp-small">{t.caller_}</text>
            </g>
          ) : (
            <g class="pp-caller">
              <rect x="186" y={Y - 22} width="60" height="40" rx="6" />
              <text x="216" y={Y + 40} text-anchor="middle" class="pp-small">{t.caller_}</text>
            </g>
          )}
          {/* the door on the machine */}
          <g class="pp-door">
            <rect x="286" y={Y - 30} width="28" height="56" rx="6" />
            <text x="300" y={Y - 40} text-anchor="middle" class="pp-mono">:{c.callerPort}</text>
          </g>
          {docker ? (
            <g>
              <rect x="372" y="78" width="244" height="116" rx="18" class="pp-box" />
              <text x="494" y="96" text-anchor="middle" class="pp-small">{t.container}</text>
              <text x="494" y="186" text-anchor="middle" class="pp-mono">{publishLabel}</text>
              <rect x="392" y={Y - 22} width="24" height="44" rx="5" class="pp-door-small" />
              <text x="404" y={Y - 30} text-anchor="middle" class="pp-mono pp-tiny">
                {c.publish ? `:${c.publish.containerPort}` : ''}
              </text>
              <rect x="452" y={Y - 24} width="150" height="48" rx="10" class="pp-app" />
              <text x="527" y={Y - 4} text-anchor="middle" class="pp-label">{t.app}</text>
              <text x="527" y={Y + 14} text-anchor="middle" class="pp-mono pp-tiny">
                {c.appAddress}:{c.appPort}
              </text>
            </g>
          ) : (
            <g>
              <rect x="344" y={Y - 24} width="150" height="48" rx="10" class="pp-app" />
              <text x="419" y={Y - 4} text-anchor="middle" class="pp-label">{t.app}</text>
              <text x="419" y={Y + 14} text-anchor="middle" class="pp-mono pp-tiny">
                {c.appAddress}:{c.appPort}
              </text>
            </g>
          )}
          {/* request path and dot */}
          <path d={`M${startX} ${Y} H${endX}`} class={`pp-path ${result.ok ? 'is-ok' : 'is-bad'}`} />
          <g class={`pp-dot ${result.ok ? 'is-ok' : 'is-bad'}`} style={{
              transform: `translateX(${dotX}px)`,
              transition: dotX === startX ? 'none' : undefined,
            }}>
            <circle cx="0" cy={Y} r="9" />
            {result.ok ? (
              <path d={`M-14 ${Y - 14} l-6 -6 M14 ${Y - 14} l6 -6 M0 ${Y - 18} v-8`} class="pp-spark" />
            ) : (
              <path d={`M-5 ${Y - 5} l10 10 M5 ${Y - 5} l-10 10`} class="pp-x" />
            )}
          </g>
        </svg>
      </figure>

      <div class={`pp-result ${result.ok ? 'is-ok' : 'is-bad'}`} data-rule={result.rule} aria-live="polite">
        <p class="pp-result-head">{result.ok ? `✓ ${t.ok}` : t.failed}</p>
        {result.error && (
          <pre class="widget-pre pp-error">
            <code>{result.error}</code>
          </pre>
        )}
        {result.rule === 'container-localhost' && (
          <p class="pp-note">
            <Inline text={t.resetNote} />
          </p>
        )}
        <p>
          <strong>{t.why}:</strong> <Inline text={rule.why} />
        </p>
        {rule.fix && (
          <p>
            <strong>{t.fix}:</strong> <Inline text={rule.fix} />
          </p>
        )}
      </div>
    </section>
  );
}
