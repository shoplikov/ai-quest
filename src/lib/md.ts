// A small Markdown renderer for frontmatter strings (mission steps, break
// texts). It supports what the level files use: `inline code`, **bold**,
// *emphasis*, [links](https://…) and fenced code blocks, which go through
// Shiki with the same theme as the MDX body. Server-side only.
import { codeToHtml } from 'shiki';
import { getDict, type Lang } from '../i18n';

export const SHIKI_THEME = 'github-dark';

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Inline Markdown → HTML. Code spans are protected from other rules. */
export function renderInline(text: string): string {
  const codes: string[] = [];
  let out = text.replace(/`([^`]+)`/g, (_m, code: string) => {
    codes.push(`<code>${escapeHtml(code)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = escapeHtml(out);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*\w])\*([^*\s][^*]*)\*(?!\w)/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
  return out.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => codes[Number(i)]!);
}

/** The wrapper every code block gets: language label and copy button. */
export function codeBlockHtml(lang: Lang, language: string, preHtml: string): string {
  const d = getDict(lang).code;
  const label = language && language !== 'plaintext' && language !== 'text' ? language : '';
  return (
    `<div class="code-block">` +
    (label ? `<span class="code-lang" aria-hidden="true">${escapeHtml(label)}</span>` : '') +
    `<button type="button" class="copy-btn" aria-label="${escapeHtml(d.copyLabel)}" data-copied="${escapeHtml(d.copied)}">${escapeHtml(d.copy)}</button>` +
    preHtml +
    `</div>`
  );
}

export async function renderCode(lang: Lang, code: string, language = 'text'): Promise<string> {
  let pre: string;
  try {
    pre = await codeToHtml(code, { lang: language || 'text', theme: SHIKI_THEME });
  } catch {
    pre = await codeToHtml(code, { lang: 'text', theme: SHIKI_THEME });
  }
  return codeBlockHtml(lang, language, pre);
}

/** Block Markdown → HTML: paragraphs, and fenced code blocks. */
export async function renderMarkdown(lang: Lang, text: string): Promise<string> {
  const parts: string[] = [];
  const fence = /^```([\w-]*)\n([\s\S]*?)\n```\s*$/gm;
  let last = 0;
  for (const m of text.matchAll(fence)) {
    parts.push(paragraphs(text.slice(last, m.index)));
    parts.push(await renderCode(lang, m[2]!, m[1] || 'text'));
    last = m.index! + m[0].length;
  }
  parts.push(paragraphs(text.slice(last)));
  return parts.join('');
}

function paragraphs(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${renderInline(p.replace(/\s*\n\s*/g, ' '))}</p>`)
    .join('');
}
