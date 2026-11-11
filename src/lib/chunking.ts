// Chunking visualiser (docs/spec/widgets.md §4). Pure logic: the widget
// draws the spans this file returns. Offsets are character positions in
// the sample text; `end` is exclusive.

export type Span = { start: number; end: number };
export type Strategy = 'fixed' | 'sentence' | 'paragraph';

export const SIZE_MIN = 100;
export const SIZE_MAX = 600;
export const SIZE_STEP = 20;
export const OVERLAP_MAX = 0.5;
export const OVERLAP_STEP = 0.05;

/** Paragraphs are separated by a blank line. Spans exclude surrounding whitespace. */
export function paragraphs(text: string): Span[] {
  const out: Span[] = [];
  for (const m of text.matchAll(/\S[\s\S]*?(?=\n[ \t]*\n|\s*$)/g)) {
    out.push({ start: m.index!, end: m.index! + m[0].length });
  }
  return out;
}

/** Sentences end with . ! ? or …, maybe followed by closing quotes, then a space or the end. */
export function sentences(text: string): Span[] {
  const out: Span[] = [];
  for (const p of paragraphs(text)) {
    const body = text.slice(p.start, p.end);
    for (const m of body.matchAll(/\S[\s\S]*?(?:[.!?…]+["'»”)]*(?=\s|$)|$)/g)) {
      if (m[0].length === 0) continue;
      out.push({ start: p.start + m.index!, end: p.start + m.index! + m[0].length });
    }
  }
  return out;
}

/** Fixed windows of `size` characters; each window starts `size × (1 − overlap)` after the last. */
function fixed(text: string, size: number, overlap: number): Span[] {
  const step = Math.max(1, Math.round(size * (1 - overlap)));
  const out: Span[] = [];
  for (let start = 0; start < text.length; start += step) {
    const end = Math.min(start + size, text.length);
    out.push({ start, end });
    if (end === text.length) break;
  }
  return out;
}

/**
 * Packs whole sentences until the next one would pass `size`, and starts a
 * new chunk at every paragraph, as structure-aware splitters do. A new
 * chunk inside a paragraph repeats the last sentences of the previous one,
 * up to `size × overlap` characters. A sentence longer than `size` becomes
 * its own chunk.
 */
function bySentence(text: string, size: number, overlap: number): Span[] {
  const out: Span[] = [];
  const length = (list: Span[]) => (list.length ? list[list.length - 1]!.end - list[0]!.start : 0);
  const emit = (list: Span[]) => out.push({ start: list[0]!.start, end: list[list.length - 1]!.end });
  for (const p of paragraphs(text)) {
    let current: Span[] = [];
    for (const s of sentences(text).filter((x) => x.start >= p.start && x.end <= p.end)) {
      if (current.length && s.end - current[0]!.start > size) {
        emit(current);
        let carry: Span[] = [];
        for (let i = current.length - 1; i >= 0; i--) {
          const next = [current[i]!, ...carry];
          if (length(next) > size * overlap) break;
          carry = next;
        }
        // The carried sentences and the new one must still fit together.
        while (carry.length && s.end - carry[0]!.start > size) carry = carry.slice(1);
        current = [...carry, s];
      } else {
        current.push(s);
      }
    }
    if (current.length) emit(current);
  }
  return out;
}

export function chunk(text: string, strategy: Strategy, size: number, overlap: number): Span[] {
  if (strategy === 'paragraph') return paragraphs(text);
  if (strategy === 'sentence') return bySentence(text, size, overlap);
  return fixed(text, size, overlap);
}

/** The span from the start of the first answer sentence to the end of the last one. */
export function answerSpan(text: string, answer: readonly string[]): Span {
  const first = text.indexOf(answer[0]!);
  const lastText = answer[answer.length - 1]!;
  const last = text.indexOf(lastText, first);
  if (first < 0 || last < 0) throw new Error('answer sentences not found in the sample text');
  return { start: first, end: last + lastText.length };
}

/** True when at least one chunk holds the whole answer. */
export function holdsAnswer(chunks: Span[], answer: Span): boolean {
  return chunks.some((c) => c.start <= answer.start && c.end >= answer.end);
}

export type Segment = Span & {
  /** Indexes of the chunks that cover this piece of text (two or more = overlap). */
  chunks: number[];
  answer: boolean;
};

/** Cuts the text at every chunk and answer boundary, for drawing. */
export function segments(length: number, chunks: Span[], answer: Span): Segment[] {
  const cuts = new Set([0, length, answer.start, answer.end]);
  for (const c of chunks) {
    cuts.add(c.start);
    cuts.add(c.end);
  }
  const points = [...cuts].filter((p) => p >= 0 && p <= length).sort((a, b) => a - b);
  const out: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!;
    const end = points[i + 1]!;
    if (end === start) continue;
    const covering = chunks.flatMap((c, k) => (c.start <= start && c.end >= end ? [k] : []));
    out.push({ start, end, chunks: covering, answer: start >= answer.start && end <= answer.end });
  }
  return out;
}

export function averageLength(chunks: Span[]): number {
  if (!chunks.length) return 0;
  return Math.round(chunks.reduce((sum, c) => sum + c.end - c.start, 0) / chunks.length);
}
