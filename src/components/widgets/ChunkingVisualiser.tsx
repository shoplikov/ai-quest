// Chunking visualiser (docs/spec/widgets.md §4). Logic lives in
// src/lib/chunking.ts; this file draws it. The sample text, the question
// and the answer sentences come in through `strings`, so each language has
// its own handbook.
import { useState } from 'preact/hooks';
import { fill, type Dict } from '../../i18n';
import {
  OVERLAP_MAX,
  OVERLAP_STEP,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_STEP,
  answerSpan,
  averageLength,
  chunk,
  holdsAnswer,
  segments,
  type Strategy,
} from '../../lib/chunking';
import { Inline } from './Inline';

type Strings = Dict['widgets']['chunkingVisualiser'];
type Props = { strings: Strings };

const STRATEGIES: Strategy[] = ['fixed', 'sentence', 'paragraph'];
const START = { strategy: 'fixed' as Strategy, size: 120, overlap: 0 };
let uid = 0;

export default function ChunkingVisualiser({ strings: t }: Props) {
  const [id] = useState(() => `cv${++uid}`);
  const [strategy, setStrategy] = useState<Strategy>(START.strategy);
  const [size, setSize] = useState(START.size);
  const [overlap, setOverlap] = useState(START.overlap);

  const answer = answerSpan(t.text, t.answer);
  const chunks = chunk(t.text, strategy, size, overlap);
  const whole = holdsAnswer(chunks, answer);
  const segs = segments(t.text.length, chunks, answer);
  const overlapOff = strategy === 'paragraph';
  const pct = Math.round(overlap * 100);

  return (
    <section class="widget chunking-visualiser" id="widget-chunking-visualiser" data-anchor aria-labelledby={`${id}-title`}>
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

      <div class="cv-controls">
        <fieldset class="seg">
          <legend>{t.strategyLegend}</legend>
          <div class="seg-options">
            {STRATEGIES.map((s) => (
              <label class={`seg-opt${strategy === s ? ' is-on' : ''}`}>
                <input type="radio" name={`${id}-strategy`} value={s} checked={strategy === s} onChange={() => setStrategy(s)} />
                <span>{t.strategies[s]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div class="cv-range">
          <label for={`${id}-size`}>{t.size}</label>
          <input
            id={`${id}-size`}
            type="range"
            min={SIZE_MIN}
            max={SIZE_MAX}
            step={SIZE_STEP}
            value={size}
            disabled={overlapOff}
            aria-valuetext={fill(t.chars, { n: size })}
            onInput={(e) => setSize(Number((e.currentTarget as HTMLInputElement).value))}
          />
          <output for={`${id}-size`}>{fill(t.chars, { n: size })}</output>
        </div>

        <div class="cv-range">
          <label for={`${id}-overlap`}>{t.overlap}</label>
          <input
            id={`${id}-overlap`}
            type="range"
            min={0}
            max={Math.round(OVERLAP_MAX * 100)}
            step={Math.round(OVERLAP_STEP * 100)}
            value={pct}
            disabled={overlapOff}
            aria-valuetext={fill(t.percent, { n: pct })}
            aria-describedby={overlapOff ? `${id}-off` : undefined}
            onInput={(e) => setOverlap(Number((e.currentTarget as HTMLInputElement).value) / 100)}
          />
          <output for={`${id}-overlap`}>{fill(t.percent, { n: pct })}</output>
        </div>
        {overlapOff && (
          <p class="cv-off" id={`${id}-off`}>
            {t.overlapOff}
          </p>
        )}
      </div>

      <p class="widget-label">{t.textLabel}</p>
      <ul class="cv-legend" aria-hidden="true">
        <li>
          <span class="cv-swatch cv-c0" />
          <span class="cv-swatch cv-c1" /> {t.legendChunk}
        </li>
        <li>
          <span class="cv-swatch cv-overlap" /> {t.legendOverlap}
        </li>
        <li>
          <span class="cv-swatch cv-ans" /> {t.legendAnswer}
        </li>
      </ul>
      <p class="cv-text">
        {segs.map((s) => {
          const piece = t.text.slice(s.start, s.end);
          if (!s.chunks.length) return <span class="cv-gap">{piece}</span>;
          const cls = ['cv-seg', `cv-c${s.chunks[0]! % 2}`, s.chunks.length > 1 ? 'cv-overlap' : '', s.answer ? 'cv-ans' : '']
            .filter(Boolean)
            .join(' ');
          return <span class={cls}>{piece}</span>;
        })}
      </p>

      <dl class="cv-stats">
        <div>
          <dt>{t.chunkCount}</dt>
          <dd>{chunks.length}</dd>
        </div>
        <div>
          <dt>{t.average}</dt>
          <dd>{fill(t.chars, { n: averageLength(chunks) })}</dd>
        </div>
      </dl>

      <div class={`cv-result ${whole ? 'is-ok' : 'is-bad'}`} aria-live="polite">
        <p class="cv-question">
          <strong>{t.questionLabel}:</strong> {t.question}
        </p>
        <p class="cv-verdict">{whole ? t.whole : t.cut}</p>
      </div>

      <button
        type="button"
        class="btn btn-ghost btn-small"
        onClick={() => {
          setStrategy(START.strategy);
          setSize(START.size);
          setOverlap(START.overlap);
        }}
      >
        ↺ {t.reset}
      </button>
    </section>
  );
}
