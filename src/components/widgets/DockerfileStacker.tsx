// Dockerfile layer stacker (docs/spec/widgets.md §3). Logic lives in
// src/lib/dockerfile.ts; this file draws it. Text comes in through `strings`.
// Lines move by pointer drag (mouse and touch), arrow keys on the handle,
// or the up/down buttons.
import { useRef, useState } from 'preact/hooks';
import { fill, type Dict } from '../../i18n';
import { LINE_TEXT, START_ORDER, moveLine, simulateBuild, type Change, type LineId } from '../../lib/dockerfile';
import { Inline } from './Inline';

type Strings = Dict['widgets']['dockerfileStacker'];
type Props = { strings: Strings };

const CHANGES: Change[] = ['app', 'requirements', 'none'];
let uid = 0;

export default function DockerfileStacker({ strings: t }: Props) {
  const [id] = useState(() => `ds${++uid}`);
  const [order, setOrder] = useState<LineId[]>(START_ORDER);
  const [change, setChange] = useState<Change>('app');
  const [dragging, setDragging] = useState<LineId | null>(null);
  const [announce, setAnnounce] = useState('');
  const listRef = useRef<HTMLOListElement>(null);

  const result = simulateBuild(order, change);
  const total = order.length;

  function move(index: number, delta: number) {
    const next = moveLine(order, index, delta);
    if (next.join() === order.join()) return;
    setOrder(next);
    const line = order[index]!;
    setAnnounce(fill(t.moved, { line: LINE_TEXT[line], n: next.indexOf(line) + 1, total }));
  }

  // Pointer drag: works for mouse and touch. The line follows the pointer
  // by swapping places whenever the pointer crosses a neighbour's middle.
  function onPointerDown(e: PointerEvent, line: LineId) {
    if (e.button !== 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(line);
  }
  function onPointerMove(e: PointerEvent, line: LineId) {
    if (dragging !== line || !listRef.current) return;
    const items = [...listRef.current.children] as HTMLElement[];
    const from = order.indexOf(line);
    let to = 0;
    items.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (e.clientY > r.top + r.height / 2) to = i;
    });
    if (e.clientY < items[0]!.getBoundingClientRect().top) to = 0;
    if (to !== from) setOrder(moveLine(order, from, to - from));
  }
  function onPointerUp(line: LineId) {
    if (dragging !== line) return;
    setDragging(null);
    setAnnounce(fill(t.moved, { line: LINE_TEXT[line], n: order.indexOf(line) + 1, total }));
  }

  const message = result.error ? t.errors[result.error] : result.verdict ? t.verdicts[result.verdict] : '';
  const tone = result.error || result.verdict === 'bad' ? 'is-bad' : result.verdict === 'good' || result.verdict === 'nothing' ? 'is-ok' : 'is-info';

  return (
    <section class="widget dockerfile-stacker" id="widget-dockerfile-stacker" data-anchor aria-labelledby={`${id}-title`}>
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

      <fieldset class="seg ds-scenarios">
        <legend>{t.scenarioLegend}</legend>
        <div class="seg-options">
          {CHANGES.map((c) => (
            <label class={`seg-opt${change === c ? ' is-on' : ''}`}>
              <input type="radio" name={`${id}-change`} value={c} checked={change === c} onChange={() => setChange(c)} />
              <span>
                <Inline text={t.scenarios[c]} />
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <p class="widget-label" id={`${id}-order`}>
        {t.orderLabel}
      </p>
      <p class="ds-hint">{t.handleHint}</p>
      <ol class="ds-lines" ref={listRef} aria-labelledby={`${id}-order`}>
        {result.lines.map((l, i) => (
          <li key={l.id} class={`ds-line is-${l.status}${dragging === l.id ? ' is-dragging' : ''}`}>
            <button
              type="button"
              class="ds-handle"
              aria-label={fill(t.drag, { line: LINE_TEXT[l.id] })}
              onPointerDown={(e) => onPointerDown(e, l.id)}
              onPointerMove={(e) => onPointerMove(e, l.id)}
              onPointerUp={() => onPointerUp(l.id)}
              onPointerCancel={() => onPointerUp(l.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  move(i, e.key === 'ArrowUp' ? -1 : 1);
                }
              }}
            >
              <svg viewBox="0 0 12 20" width="12" height="20" aria-hidden="true">
                {[4, 10, 16].map((y) => (
                  <>
                    <circle cx="3" cy={y} r="1.6" />
                    <circle cx="9" cy={y} r="1.6" />
                  </>
                ))}
              </svg>
            </button>
            <span class="ds-num" aria-hidden="true">
              {i + 1}
            </span>
            <code class="ds-code">{LINE_TEXT[l.id]}</code>
            <span class="ds-status">{fill(t.status[l.status], { s: l.seconds })}</span>
            <span class="ds-moves">
              <button type="button" class="ds-move" aria-label={fill(t.moveUp, { line: LINE_TEXT[l.id] })} disabled={i === 0} onClick={() => move(i, -1)}>
                ↑
              </button>
              <button
                type="button"
                class="ds-move"
                aria-label={fill(t.moveDown, { line: LINE_TEXT[l.id] })}
                disabled={i === total - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ol>
      <p class="visually-hidden" aria-live="polite">
        {announce}
      </p>

      <div class={`ds-result ${tone}`} aria-live="polite">
        <p class="ds-total">
          <span class="ds-total-label">{t.total}</span>
          <span class="ds-total-value">{fill(t.seconds, { s: result.total })}</span>
        </p>
        <p class="ds-verdict">{message}</p>
      </div>

      <button
        type="button"
        class="btn btn-ghost btn-small"
        onClick={() => {
          setOrder(START_ORDER);
          setChange('app');
          setAnnounce('');
        }}
      >
        ↺ {t.reset}
      </button>
    </section>
  );
}
