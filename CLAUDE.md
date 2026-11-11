# AI Engineer Quest — instructions for the building agent

This repo is a static learning website that takes a junior AI engineer to
middle level. The design is finished. Your job is to build it exactly as
specified.

## Read these first, in this order

1. `docs/BUILD-GUIDE.md` — the ordered task list. Work top to bottom.
2. `docs/spec/product.md` — pages, behaviour, progress data model.
   Then `docs/spec/i18n.md` — the site is in English and Russian; this
   file overrides the other specs wherever they assume one language.
3. `docs/spec/design.md` — colours, type, components, mascot, motion.
4. `docs/spec/content-guide.md` — voice, level file schema.
5. `docs/spec/levels.md` — the facts for every level. Source of truth.
6. `docs/spec/extras.md` — boss, skills page, glossary, mentor guide, home copy.
7. `docs/spec/widgets.md` — exact logic for each interactive widget.
8. `src/content/levels/en/2-ports.mdx` and `src/content/levels/ru/2-ports.mdx`
   — the finished example level in both languages. Every other level
   must match their depth, tone and structure.

## Rules

- Do one task from the build guide at a time. Tick its box, run its checks,
  commit, then move on.
- Do not invent technical facts. If `levels.md` does not cover something,
  check official docs (context7) before writing it.
- Every visible text exists in both languages. Write the Russian as
  Russian, following `docs/spec/i18n.md`; do not translate word by word.
- Do not change the voice. Lessons: kind, clear, funny. Porto the otter:
  sarcastic and absurd about technology and himself. Nobody ever mocks
  the learner.
- Gender-neutral wording about the learner in both languages
  (`docs/spec/i18n.md`); `tests/neutral.test.ts` guards it.
- No personal data anywhere in the repo. No real names, no company names,
  no internal IPs or hostnames.
- No backend, no analytics, no external fonts or CDNs. Everything is
  self-hosted and works offline after load.
- Never `git push`, never create a remote, never touch AWS. The owner does
  those later from `docs/SETUP-GITHUB-AWS.md`.
- Commit messages: short imperative subject, e.g. `Add quest map page`.
- If a check in the build guide fails, fix it before going on. Report
  failures honestly; do not mark a task done that is not done.
- If a spec is unclear or two specs disagree, stop and ask the owner.
