// Error quiz (docs/spec/widgets.md §6). State logic in src/lib/quiz.ts.
// The best score is the only widget data saved to progress.
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { fill, type Dict } from '../../i18n';
import { advance, choose, isCorrect, score, startQuiz, type QuizQuestion } from '../../lib/quiz';
import { level, recordQuiz } from '../../lib/progress';
import { getProgress, isViewMode, subscribe, updateProgress } from '../../lib/store';
import Porto from '../porto/Porto';
import { Inline } from './Inline';

type Props = {
  level: number;
  quiz: QuizQuestion[];
  strings: Dict['widgets']['quiz'];
  lines: { hit: readonly string[]; miss: readonly string[] };
};

const pick = (list: readonly string[]) => list[Math.floor(Math.random() * list.length)]!;
let uid = 0;

export default function ErrorQuiz({ level: levelId, quiz, strings: t, lines }: Props) {
  const [id] = useState(() => `qz${++uid}`);
  const [state, setState] = useState(() => startQuiz(quiz.length));
  const [line, setLine] = useState('');
  const [best, setBest] = useState(0);
  const [view, setView] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Read the saved best score (client only) and follow changes.
  useEffect(() => {
    const sync = () => {
      setBest(level(getProgress(), levelId).quizBest);
      setView(isViewMode());
    };
    sync();
    return subscribe(sync);
  }, [levelId]);

  const q = quiz[state.index]!;
  const chosen = state.answers[state.index] ?? null;
  const correct = isCorrect(quiz, state);
  const total = quiz.length;

  function onChoose(option: number) {
    if (chosen !== null) return;
    const next = choose(state, option);
    setState(next);
    setLine(pick(option === q.answer ? lines.hit : lines.miss));
  }

  useLayoutEffect(() => {
    if (chosen !== null) nextRef.current?.focus();
  }, [chosen]);

  function onAdvance() {
    const next = advance(state);
    setState(next);
    setLine('');
    if (next.finished) {
      const s = score(quiz, next);
      const before = level(getProgress(), levelId).quizBest;
      const saved = updateProgress((p) => recordQuiz(p, levelId, s));
      setNewBest(Boolean(saved) && s > before);
      requestAnimationFrame(() => endRef.current?.focus());
    }
  }

  function restart() {
    setState(startQuiz(quiz.length));
    setLine('');
    setNewBest(false);
  }

  if (state.finished) {
    const s = score(quiz, state);
    return (
      <section class="widget quiz" id="widget-error-quiz" aria-labelledby={`${id}-title`}>
        <h3 id={`${id}-title`} class="widget-title">{t.title}</h3>
        <div class="quiz-end" tabIndex={-1} ref={endRef}>
          <Porto mood={s === total ? 'cheer' : 'hello'} size={88} />
          <div>
            <p class="quiz-score">{fill(t.score, { score: s, total })}</p>
            {newBest && <p class="quiz-best is-new">{t.newBest}</p>}
            <p class="quiz-best">{fill(t.best, { best: Math.max(best, view ? 0 : s), total })}</p>
            {view && <p class="quiz-note">{t.viewOnly}</p>}
            <button type="button" class="btn btn-primary" onClick={restart}>
              {t.tryAgain}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section class="widget quiz" id="widget-error-quiz" aria-labelledby={`${id}-title`}>
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

      <p class="quiz-progress">
        {fill(t.questionOf, { n: state.index + 1, total })}
        {best > 0 && <span class="quiz-best-inline"> · {fill(t.best, { best, total })}</span>}
      </p>
      <p class="quiz-q" id={`${id}-q`}>
        <Inline text={q.q} />
      </p>
      {q.code && (
        <pre class="widget-pre">
          <code>{q.code}</code>
        </pre>
      )}
      <div class="quiz-options" role="group" aria-labelledby={`${id}-q`}>
        {q.options.map((opt, i) => {
          const state_ =
            chosen === null ? '' : i === q.answer ? 'is-right' : i === chosen ? 'is-wrong' : 'is-dim';
          return (
            <button
              type="button"
              class={`quiz-option ${state_}`}
              aria-disabled={chosen !== null}
              aria-pressed={chosen === i}
              onClick={() => onChoose(i)}
            >
              <span class="quiz-letter" aria-hidden="true">
                {String.fromCharCode(65 + i)}
              </span>
              <span>
                <Inline text={opt} />
              </span>
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {chosen !== null && (
          <div class={`quiz-feedback ${correct ? 'is-right' : 'is-wrong'}`}>
            <Porto mood={correct ? 'cheer' : 'thinking'} size={64} />
            <div>
              <p class="quiz-verdict">{correct ? t.right : t.wrong}</p>
              {!correct && <p class="quiz-answer">{fill(t.answerWas, { answer: q.options[q.answer]! })}</p>}
              <p>
                <Inline text={q.why} />
              </p>
              <p class="quiz-line">{line}</p>
              <button type="button" class="btn btn-primary btn-small" ref={nextRef} onClick={onAdvance}>
                {state.index + 1 >= total ? t.finish : t.next} →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
