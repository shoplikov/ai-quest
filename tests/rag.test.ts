import { describe, expect, it } from 'vitest';
import { CORRECT, KEEP, STAGES, TOP, retrieve, rerank, rrf, runPipeline } from '../src/lib/rag';
import { en } from '../src/i18n/en';
import { ru } from '../src/i18n/ru';

describe('rrf', () => {
  it('adds 1 / (60 + rank) from every list', () => {
    const fused = rrf([
      [{ id: 'receipt', score: 0.9 }, { id: 'refund', score: 0.8 }],
      [{ id: 'refund', score: 0.5 }],
    ]);
    expect(fused[0]).toEqual({ id: 'refund', score: 1 / 62 + 1 / 61 });
    expect(fused[1]).toEqual({ id: 'receipt', score: 1 / 61 });
  });

  it('a chunk in both lists beats a chunk ranked first in only one', () => {
    const fused = rrf([
      [{ id: 'giftcards', score: 1 }, { id: 'refund', score: 0.9 }],
      [{ id: 'holidays', score: 1 }, { id: 'refund', score: 0.9 }],
    ]);
    expect(fused[0]!.id).toBe('refund');
  });

  it('keeps first-seen order on ties and lists each chunk once', () => {
    const fused = rrf([[{ id: 'giftcards', score: 1 }], [{ id: 'holidays', score: 1 }]]);
    expect(fused.map((h) => h.id)).toEqual(['giftcards', 'holidays']);
  });
});

describe('runPipeline', () => {
  it('normal run: both lists have 4, the correct chunk is second after fusion and first after rerank', () => {
    const run = runPipeline(false);
    expect(run.vector).toHaveLength(TOP);
    expect(run.keyword).toHaveLength(TOP);
    expect(run.fused.map((h) => h.id).indexOf(CORRECT)).toBe(1);
    expect(run.reranked).toHaveLength(KEEP);
    expect(run.reranked[0]!.id).toBe(CORRECT);
    expect(run).toMatchObject({ retrieved: true, supported: true, cited: true });
  });

  it('fusion lists every retrieved chunk exactly once', () => {
    const run = runPipeline(false);
    const ids = run.fused.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set([...run.vector, ...run.keyword].map((h) => h.id)));
  });

  it('broken retrieval: the correct chunk is gone from every later stage', () => {
    const run = runPipeline(true);
    for (const list of [run.vector, run.keyword, run.fused, run.reranked]) {
      expect(list.some((h) => h.id === CORRECT)).toBe(false);
    }
    expect(run.vector).toHaveLength(TOP);
    expect(run).toMatchObject({ retrieved: false, supported: false, cited: true });
  });

  it('rerank keeps the best by cross-encoder score', () => {
    const top = rerank(retrieve(false).vector, 2);
    expect(top.map((h) => h.id)).toEqual(['refund', 'receipt']);
  });
});

for (const [lang, d] of Object.entries({ en, ru })) {
  it(`dictionary (${lang}) has text for every stage and chunk`, () => {
    const t = d.widgets.ragPipeline;
    for (const s of STAGES) {
      expect(t.stages[s].name.length).toBeGreaterThan(0);
      expect(t.stages[s].in.length).toBeGreaterThan(0);
      expect(t.stages[s].wrong.length).toBeGreaterThan(0);
    }
    const ids = new Set([...runPipeline(false).fused, ...runPipeline(true).fused, ...retrieve(false).vector].map((h) => h.id));
    for (const id of ids) expect(t.chunks[id].length).toBeGreaterThan(0);
  });
}
