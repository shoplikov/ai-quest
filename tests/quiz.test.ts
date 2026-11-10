import { describe, expect, it } from 'vitest';
import { advance, choose, isCorrect, score, startQuiz, type QuizQuestion } from '../src/lib/quiz';

const quiz: QuizQuestion[] = [
  { q: 'a', options: ['x', 'y', 'z'], answer: 0, why: '' },
  { q: 'b', options: ['x', 'y', 'z'], answer: 2, why: '' },
  { q: 'c', options: ['x', 'y', 'z'], answer: 1, why: '' },
];

describe('error quiz', () => {
  it('starts at the first question with nothing answered', () => {
    expect(startQuiz(3)).toEqual({ index: 0, answers: [null, null, null], finished: false });
  });

  it('cannot advance before answering', () => {
    const s = startQuiz(3);
    expect(advance(s)).toBe(s);
  });

  it('keeps the first choice', () => {
    let s = choose(startQuiz(3), 1);
    s = choose(s, 0);
    expect(s.answers[0]).toBe(1);
    expect(isCorrect(quiz, s)).toBe(false);
  });

  it('counts right answers and never subtracts for wrong ones', () => {
    let s = startQuiz(3);
    s = advance(choose(s, 0)); // right
    s = advance(choose(s, 0)); // wrong
    expect(s.finished).toBe(false);
    s = advance(choose(s, 1)); // right
    expect(s.finished).toBe(true);
    expect(score(quiz, s)).toBe(2);
  });

  it('full score', () => {
    let s = startQuiz(3);
    for (const q of quiz) s = advance(choose(s, q.answer));
    expect(score(quiz, s)).toBe(3);
  });

  it('ignores choices after finishing', () => {
    let s = startQuiz(1);
    s = advance(choose(s, 0));
    expect(choose(s, 2)).toBe(s);
  });
});
