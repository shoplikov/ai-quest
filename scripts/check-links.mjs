#!/usr/bin/env node
// Checks every external link in the level files.
// Usage: npm run links
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src/content/levels/en', 'src/content/levels/ru'];
// Only the "Go deeper" links: frontmatter lines of the form `url: "https://…"`.
// Addresses inside lessons (localhost, example hosts) are not meant to be opened.
const URL_RE = /^\s*url:\s*"(https?:\/\/[^"]+)"/gm;

const found = new Map(); // url -> files
for (const dir of ROOTS) {
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.mdx'))) {
    const file = join(dir, name);
    for (const m of readFileSync(file, 'utf8').matchAll(URL_RE)) {
      found.set(m[1], [...(found.get(m[1]) ?? []), file]);
    }
  }
}

async function check(url) {
  const headers = { 'user-agent': 'Mozilla/5.0 (link-check)', accept: 'text/html,*/*' };
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, { method, headers, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      if (res.ok) return null;
      if (method === 'GET') return `HTTP ${res.status}`;
    } catch (error) {
      if (method === 'GET') return error.cause?.code ?? error.name;
    }
  }
  return 'failed';
}

const urls = [...found.keys()].sort();
const results = await Promise.all(urls.map(async (url) => [url, await check(url)]));
// Some sites refuse robots (403, 429) although the page exists: list them
// apart, to be opened by hand.
const blocked = results.filter(([, problem]) => problem === 'HTTP 403' || problem === 'HTTP 429');
const failures = results.filter(([, problem]) => problem && problem !== 'HTTP 403' && problem !== 'HTTP 429');
for (const [url, problem] of failures) {
  console.log(`FAIL ${problem}  ${url}\n     in ${[...new Set(found.get(url))].join(', ')}`);
}
for (const [url, problem] of blocked) {
  console.log(`CHECK BY HAND (${problem}, the site refuses robots)  ${url}`);
}
console.log(`${urls.length} links checked, ${failures.length} failed, ${blocked.length} to check by hand.`);
process.exit(failures.length ? 1 : 0);
