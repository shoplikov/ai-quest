// RAG pipeline walkthrough (docs/spec/widgets.md §5). Fixed example data
// for one question, and the two calculations the widget shows: reciprocal
// rank fusion and reranking. Chunk texts live in the dictionaries; here
// chunks are only ids.

export type ChunkId = 'refund' | 'receipt' | 'giftcards' | 'complaints' | 'payments' | 'holidays' | 'allergy';
export type Hit = { id: ChunkId; score: number };
export type StageId = 'question' | 'rewrite' | 'embed' | 'retrieve' | 'fuse' | 'rerank' | 'prompt' | 'generate' | 'check';

export const STAGES: StageId[] = ['question', 'rewrite', 'embed', 'retrieve', 'fuse', 'rerank', 'prompt', 'generate', 'check'];

/** The chunk that holds the answer. */
export const CORRECT: ChunkId = 'refund';

/** RRF constant: each chunk scores 1 / (K + rank) in each list. */
export const RRF_K = 60;
export const TOP = 4;
export const KEEP = 3;

/** First numbers of the question's embedding, and its real length (multilingual-e5-small). */
export const VECTOR_PREVIEW = [0.021, -0.047, 0.013, 0.088, -0.032, 0.005, -0.061, 0.044];
export const VECTOR_LENGTH = 384;

/** Vector search: cosine similarity, best first. One spare hit fills the gap when a chunk is removed. */
const VECTOR_HITS: Hit[] = [
  { id: 'receipt', score: 0.84 },
  { id: 'refund', score: 0.81 },
  { id: 'giftcards', score: 0.66 },
  { id: 'complaints', score: 0.61 },
  { id: 'payments', score: 0.55 },
];

/** Keyword search: full-text rank, best first. Only chunks that share words with the query. */
const KEYWORD_HITS: Hit[] = [
  { id: 'receipt', score: 0.52 },
  { id: 'refund', score: 0.47 },
  { id: 'holidays', score: 0.31 },
  { id: 'allergy', score: 0.12 },
];

/** What the cross-encoder says when it reads the question and each chunk together. */
export const RERANK_SCORES: Record<ChunkId, number> = {
  refund: 0.96,
  receipt: 0.41,
  giftcards: 0.08,
  complaints: 0.06,
  payments: 0.04,
  holidays: 0.03,
  allergy: 0.01,
};

export function retrieve(broken: boolean): { vector: Hit[]; keyword: Hit[] } {
  const keep = (list: Hit[]) => list.filter((h) => !broken || h.id !== CORRECT).slice(0, TOP);
  return { vector: keep(VECTOR_HITS), keyword: keep(KEYWORD_HITS) };
}

/** Reciprocal rank fusion: add 1 / (k + rank) from every list; best first, ties keep first-seen order. */
export function rrf(lists: Hit[][], k = RRF_K): Hit[] {
  const scores = new Map<ChunkId, number>();
  for (const list of lists) {
    list.forEach((h, i) => scores.set(h.id, (scores.get(h.id) ?? 0) + 1 / (k + i + 1)));
  }
  return [...scores.entries()].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
}

export function rerank(candidates: Hit[], keep = KEEP): Hit[] {
  return candidates
    .map((h) => ({ id: h.id, score: RERANK_SCORES[h.id] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, keep);
}

export type PipelineRun = {
  vector: Hit[];
  keyword: Hit[];
  fused: Hit[];
  reranked: Hit[];
  /** Did the chunk with the answer reach the prompt? */
  retrieved: boolean;
  /** Is the answer supported by the chunks it was given? */
  supported: boolean;
  /** Does the answer cite a source? (It does in both cases — citing is not the same as being right.) */
  cited: boolean;
};

export function runPipeline(broken: boolean): PipelineRun {
  const { vector, keyword } = retrieve(broken);
  const fused = rrf([vector, keyword]);
  const reranked = rerank(fused);
  const retrieved = reranked.some((h) => h.id === CORRECT);
  return { vector, keyword, fused, reranked, retrieved, supported: retrieved, cited: true };
}
