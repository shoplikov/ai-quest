// Error quiz logic (docs/spec/widgets.md §6). Pure state transitions.

export type QuizQuestion = { q: string; code?: string; options: string[]; answer: number; why: string };

export type QuizState = {
  index: number;
  /** The chosen option per question; null = not answered yet. */
  answers: (number | null)[];
  finished: boolean;
};

export function startQuiz(length: number): QuizState {
  return { index: 0, answers: Array.from({ length }, () => null), finished: false };
}

/** Choose an option for the current question. A second choice is ignored. */
export function choose(state: QuizState, option: number): QuizState {
  if (state.finished || state.answers[state.index] !== null) return state;
  const answers = [...state.answers];
  answers[state.index] = option;
  return { ...state, answers };
}

/** Go to the next question, or finish after the last one. */
export function advance(state: QuizState): QuizState {
  if (state.answers[state.index] === null) return state;
  if (state.index + 1 >= state.answers.length) return { ...state, finished: true };
  return { ...state, index: state.index + 1 };
}

export function isCorrect(quiz: readonly QuizQuestion[], state: QuizState, index = state.index): boolean | null {
  const a = state.answers[index];
  if (a === null || a === undefined) return null;
  return a === quiz[index]!.answer;
}

/** Number of right answers. Wrong answers never subtract. */
export function score(quiz: readonly QuizQuestion[], state: QuizState): number {
  return state.answers.reduce<number>((n, a, i) => n + (a !== null && a === quiz[i]!.answer ? 1 : 0), 0);
}
