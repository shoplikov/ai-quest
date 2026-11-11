// RAG pipeline walkthrough (docs/spec/widgets.md §5). Logic and example
// data live in src/lib/rag.ts; texts come in through `strings`. The stage
// cards are a tab list: click, or use the arrow keys, Home and End.
import { useRef, useState } from 'preact/hooks';
import { fill, type Dict } from '../../i18n';
import { CORRECT, STAGES, VECTOR_LENGTH, VECTOR_PREVIEW, runPipeline, type Hit, type StageId } from '../../lib/rag';

type Strings = Dict['widgets']['ragPipeline'];
type Props = { strings: Strings };

let uid = 0;

export default function RagPipeline({ strings: t }: Props) {
  const [id] = useState(() => `rp${++uid}`);
  const [current, setCurrent] = useState<StageId>('question');
  const [broken, setBroken] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const run = runPipeline(broken);
  const index = STAGES.indexOf(current);
  const stage = t.stages[current];
  const bad = (s: StageId) => broken && (s === 'retrieve' || s === 'check');

  function select(i: number) {
    const next = (i + STAGES.length) % STAGES.length;
    setCurrent(STAGES[next]!);
    tabs.current[next]?.focus();
  }
  function onKey(e: KeyboardEvent) {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: STAGES.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key]!);
    }
  }

  const list = (title: string, hits: Hit[], digits = 2) => (
    <div class="rp-list">
      <p class="rp-list-title">{title}</p>
      <ol>
        {hits.map((h) => (
          <li class={h.id === CORRECT ? 'is-answer' : undefined}>
            <span class="rp-chunk">{t.chunks[h.id]}</span>
            <span class="rp-score">{h.score.toFixed(digits)}</span>
          </li>
        ))}
      </ol>
    </div>
  );

  function output() {
    switch (current) {
      case 'question':
        return <p class="rp-quote">{t.question}</p>;
      case 'rewrite':
        return <p class="rp-quote mono">{t.rewritten}</p>;
      case 'embed':
        return (
          <p class="rp-quote mono">
            [{VECTOR_PREVIEW.map((n) => n.toFixed(3)).join(', ')}, {fill(t.vectorMore, { n: VECTOR_LENGTH })}]
          </p>
        );
      case 'retrieve':
        return (
          <>
            <div class="rp-lists">
              {list(t.vectorList, run.vector)}
              {list(t.keywordList, run.keyword)}
            </div>
            {broken && <p class="rp-alert">{t.missing}</p>}
          </>
        );
      case 'fuse':
        return list(t.fusedList, run.fused, 4);
      case 'rerank':
        return list(t.rerankedList, run.reranked);
      case 'prompt':
        return (
          <pre class="rp-prompt">
            {t.promptRules}
            {'\n\n'}
            {run.reranked.map((h, i) => `[${i + 1}] ${t.chunks[h.id]}\n`).join('')}
            {'\n'}
            {t.promptQuestion}: {t.question}
          </pre>
        );
      case 'generate':
        return <p class={`rp-quote${broken ? ' is-bad' : ''}`}>{broken ? t.answers.broken : t.answers.ok}</p>;
      case 'check':
        return (
          <>
            <ul class="rp-checks">
              {(['retrieved', 'supported', 'cited'] as const).map((k) => (
                <li class={run[k] ? 'is-ok' : 'is-bad'}>
                  <span aria-hidden="true">{run[k] ? '✓' : '✗'}</span> {t.checks[k]}: <strong>{run[k] ? t.yes : t.no}</strong>
                </li>
              ))}
            </ul>
            {broken && <p class="rp-alert">{t.breakCaption}</p>}
          </>
        );
    }
  }

  return (
    <section class="widget rag-pipeline" id="widget-rag-pipeline" data-anchor aria-labelledby={`${id}-title`}>
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

      <label class="check-inline rp-break">
        <input type="checkbox" checked={broken} onChange={(e) => setBroken((e.currentTarget as HTMLInputElement).checked)} />
        {t.breakToggle}
      </label>

      <div class="rp-stages" role="tablist" aria-label={t.stagesLabel} onKeyDown={onKey}>
        {STAGES.map((s, i) => (
          <button
            type="button"
            role="tab"
            id={`${id}-tab-${s}`}
            aria-selected={s === current}
            aria-controls={`${id}-panel`}
            tabIndex={s === current ? 0 : -1}
            class={`rp-stage${s === current ? ' is-on' : ''}${bad(s) ? ' is-bad' : ''}`}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            onClick={() => setCurrent(s)}
          >
            <span class="rp-num">{i + 1}</span>
            <span class="rp-name">{t.stages[s].name}</span>
          </button>
        ))}
      </div>

      <div class="rp-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${current}`}>
        <div class="rp-block">
          <p class="widget-label">{t.goesIn}</p>
          <p>{stage.in}</p>
        </div>
        <div class="rp-block">
          <p class="widget-label">{t.comesOut}</p>
          <p>{stage.out}</p>
          {output()}
        </div>
        <div class="rp-block rp-wrong">
          <p class="widget-label">{t.canGoWrong}</p>
          <p>{stage.wrong}</p>
        </div>
      </div>
    </section>
  );
}
