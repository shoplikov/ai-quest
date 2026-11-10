# Build guide

Ordered tasks for the building agent. Do them top to bottom. For each
task: build it, run its checks, tick the box, commit.

## Already done (do not redo)

- [x] Repo created, dependencies installed: `astro@7`, `@astrojs/mdx`,
      `@astrojs/preact`, `preact`, `@astrojs/check`, `typescript`.
- [x] All specs in `docs/spec/`.
- [x] Level 2 content in both languages: `src/content/levels/en/2-ports.mdx`
      and `src/content/levels/ru/2-ports.mdx`.
- [x] `Dockerfile`, `.dockerignore`, `nginx.conf`, `compose.yaml`,
      `Caddyfile`, `scripts/deploy.sh`, `scripts/rollback.sh`,
      `.github/workflows/ci.yml`. Do not change their behaviour;
      `docs/SETUP-GITHUB-AWS.md` depends on it.
- [x] `docs/SETUP-GITHUB-AWS.md`.

## Before you start

- Astro 7 is newer than most examples you remember. Before writing config,
  content collections or islands, look up the current API in the Astro
  docs (context7). Do the same for Preact 11 if something does not work.
- `package.json` must end up with these scripts, which CI calls:
  `dev` (`astro dev`), `build` (`astro build`), `preview` (`astro preview`),
  `check` (`astro check`), `test` (`vitest run`),
  `links` (`node scripts/check-links.mjs`).
- Set `"type": "module"` and `"private": true`; remove the placeholder
  `main` and `test` entries that `npm init` created.

## Phase 1 — Foundation

- [x] **1.1 Project config.** `astro.config.mjs` with MDX and Preact,
      static output. `tsconfig.json` extending Astro's strict preset with
      Preact JSX. Install `vitest`, `@fontsource-variable/nunito` and
      `@fontsource-variable/jetbrains-mono`. Set up i18n routing for
      `en` and `ru`, both prefixed, per `docs/spec/i18n.md`. Add the scripts above.
      *Check:* `npm run build` succeeds on an empty index page.
- [x] **1.1b Languages.** `src/i18n/en.ts` and `ru.ts` typed
      dictionaries with a `t()` helper and plural helper; the `/`
      redirect page; the EN | RU switcher; `<html lang>` and `hreflang`.
      From here on, every string you add goes into both dictionaries.
      *Check:* `/` redirects by browser language and by saved choice;
      the switcher keeps you on the same page; Vitest tests for Russian
      plurals (1, 2, 5, 11, 21, 22).
- [x] **1.2 Design tokens and base styles.** `src/styles/tokens.css`,
      `base.css`, `print.css` exactly as in `docs/spec/design.md`. Theme
      script in `<head>` to avoid a flash.
      *Check:* both themes render; toggling works; no flash on reload.
- [x] **1.3 Layout.** `src/layouts/Base.astro`: head, nav, footer, theme
      toggle, view-mode banner slot, toast area.
      *Check:* keyboard-only navigation works; 360px wide has no sideways scroll.
- [x] **1.4 Base components.** Card, Button, Pill, TickRow, ProgressRing,
      SpeechBubble, Reveal, Dialog, Toast, code block with copy button.
      Build a temporary `/kitchen-sink` page showing all of them in both
      themes; delete it in task 6.4.
      *Check:* look at `/kitchen-sink` in Chrome, light and dark.
- [x] **1.5 Porto.** Four mood SVG components and `src/data/porto.ts`
      line pools (at least 6 lines per pool, in the voice of the content guide).
      *Check:* all four moods on `/kitchen-sink`; he looks like one character.

## Phase 2 — Progress and map

- [x] **2.1 Progress store.** `src/lib/progress.ts` per the product spec:
      load, save, subscribe, derived values (current level, XP, rank,
      streak, badges), share-link encode/decode, view mode, reset.
      Pure functions, no DOM access outside small wrappers.
      *Check:* Vitest unit tests for XP, rank thresholds, streak (today,
      yesterday, broken), current level, badges, share-link round trip,
      and rejection of broken share data.
- [x] **2.2 Content collection.** Zod schema for level frontmatter from
      `docs/spec/content-guide.md`; glossary collection.
      *Check:* `npm run check` passes with `2-ports.mdx`; removing a
      required field makes it fail (then put it back). Add
      `tests/content-parity.test.ts` from `docs/spec/i18n.md`.
      *Check:* the parity test passes for Level 2 and fails if you delete
      one mission from the Russian file (then put it back).
- [x] **2.3 Quest map.** Desktop and phone SVG layouts, landmarks, node
      states, welcome card, XP bar, streak, badges row, "Today's next
      step", share button.
      *Check:* in Chrome — first visit, entering a name, reload keeps it;
      set progress by hand in localStorage and see nodes change state.

## Phase 3 — Level page, with Level 2 as the bar

- [x] **3.1 Level template.** `src/pages/level/[id].astro` and section
      components for every part listed in the product spec, in order.
      Ticking updates XP with a toast. "Finish level" flow with confetti,
      badge dialog and kind note.
- [x] **3.2 Diagram and Analogy components.** `Diagram.astro` picks a
      diagram by `name`. Draw Level 2's four diagrams:
      `building-with-doors`, `localhost-vs-all`, `reverse-proxy`,
      `ssh-tunnel`, in the hand-drawn style of the design spec.
- [x] **3.3 Port playground.** Logic in `src/lib/ports.ts` with one test
      per rule in `docs/spec/widgets.md`; then the view.
- [x] **3.4 Request journey.** Stepper plus the "Where would it break?" part.
- [x] **3.5 Error quiz.**
- [ ] **3.6 Cheat sheet page** for a level, with print styles.
      *Check for phase 3:* walk Level 2 end to end in Chrome, in English
      and in Russian, at desktop and phone width, both themes: tick every mission, reveal every break,
      play every rule of the port playground, finish the quiz, finish the
      level, see confetti and the kind note, reload — everything stayed.
      Print preview of the cheat sheet fits one page.

> **Stop here and show the owner Level 2** before writing more levels.
> The remaining levels copy whatever is approved.

## Phase 4 — Remaining content

One task per level. For each: write the English level file from
`docs/spec/levels.md` (full sentences, full steps, same depth as Level 2),
then the Russian file (natural Russian, terms and voice from
`docs/spec/i18n.md`), draw its diagrams with labels in both languages,
build its widget if it has one.

- [ ] **4.1 Level 1 — Terminal.** Diagrams: `file-tree`, `pipe`, `permissions`.
- [ ] **4.2 Level 3 — Backend.** Diagrams: `request-response`, `event-loop`, `project-layout`.
- [ ] **4.3 Level 4 — Docker.** Diagrams: `image-vs-container`, `volume`,
      `compose-network`. Widget: Dockerfile layer stacker (logic + tests first).
- [ ] **4.4 Level 5 — Data.** Diagrams: `join`, `migrations-timeline`, `meaning-map`, `cache-aside`.
- [ ] **4.5 Level 6 — LLM serving.** Diagrams: `context-window`, `streaming-timeline`.
- [ ] **4.6 Level 7 — RAG.** Diagrams: `rag-two-pipelines`, `hybrid-fusion`,
      `eval-loop`. Widgets: chunking visualiser, RAG pipeline walkthrough
      (logic + tests first). Write the Otter Café handbook sample text.
- [ ] **4.7 Level 8 — Ship it.** Diagrams: `health-vs-ready`, `p95`, `deploy-rollback`.

*Check for every level:* `npm run check` and the parity test pass; the
Russian page was read top to bottom as Russian, not as a translation; the page reads well top
to bottom; every command in it was checked against official docs; every
quiz has exactly 5 questions with the right answer marked; no banned
words from the content guide (`grep -rniE "\b(simply|obviously|just|easy)\b" src/content`
— review each hit; "just" is allowed only in the sense of "only").

## Phase 5 — Other pages

- [ ] **5.1 Boss page** with requirements, diagram `boss-architecture`,
      rubric, finish flow, printable certificate.
- [ ] **5.2 Skills page** with ratings and radar chart.
- [ ] **5.3 Glossary** with filter.
- [ ] **5.4 Cheat sheets index.**
- [ ] **5.5 Mentor page.**
- [ ] **5.6 404 page**, one page with both languages.
- [ ] **5.7 View mode.** Open a share link in a private window: banner
      shows, ticks are disabled, nothing is saved, Exit works.

## Phase 6 — Ship-ready

- [ ] **6.1 Link checker.** `scripts/check-links.mjs`: collect every
      external URL from the level files, request each, print failures.
      Replace dead links with the closest official page.
      *Check:* `npm run links` reports zero failures.
- [ ] **6.2 Docker.** `docker build -t ai-quest .` then
      `docker compose up -d`.
      *Check:* `curl -I http://localhost:8080` is 200;
      `curl http://localhost:8080/healthz` prints `ok`;
      `docker inspect -f '{{.State.Health.Status}}' ai-quest` is `healthy`;
      a deep link such as `/level/2` loads directly; an unknown path shows
      the 404 page. Then `docker compose down`.
- [ ] **6.3 README.** Short: what it is, screenshot, how to run locally,
      how to edit a level, link to the setup guide. Use Mermaid for any
      diagram, not ASCII art.
- [ ] **6.4 Final pass.** Delete `/kitchen-sink`. Run `npm run check`,
      `npm test`, `npm run build` — all clean. In Chrome, walk the whole
      map in both languages at desktop and 360px, light and dark, with reduced motion on and
      off. Lighthouse desktop: performance ≥ 95, accessibility ≥ 95.
      Search the repo for personal data, real hostnames and internal IPs
      — there must be none.
- [ ] **6.5 Report to the owner:** what was built, what was checked and
      how, anything that could not be verified, and that the repo is ready
      for `docs/SETUP-GITHUB-AWS.md`.

## Not your job

Creating the GitHub repo, pushing, creating AWS resources, deploying.
The owner does these.
