# Product spec

## Purpose

One learner, one mentor. The learner is a junior AI engineer who finds
ports, Docker, backend and production work hard. After about 12 weeks she
should be able to take a feature from idea to production alone, debug her
own problems, and know when to ask.

She likes visuals, humour and kind encouragement. The site must feel like a
gift someone made with care, not a corporate training portal.

## Non-goals

- No accounts, no server-side state, no tracking.
- Not a full course with videos. It is a map, missions and explanations.
- Not a general "learn ML" site. No model training, no maths.

## What would make it a failure

- It makes her feel behind or judged.
- The technical content is wrong or vague ("learn Docker").
- It looks impressive but she cannot tell what to do today.

## Stack

- Astro (static output), MDX for level bodies, Preact islands for widgets.
- TypeScript, strict.
- Plain CSS with custom properties. No Tailwind, no UI library.
- Fonts self-hosted through `@fontsource-variable/*` packages.
- Built site is plain files served by nginx in Docker.

Check the installed Astro version and use its current content-collections
API (look it up in the docs; do not guess from memory).

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Quest map |
| `/level/[id]` | Level page, `id` = 1..8 |
| `/boss` | Final project |
| `/skills` | Skills matrix + radar chart |
| `/glossary` | Terms |
| `/cheatsheets` | Index; `/cheatsheets/[id]` printable page per level |
| `/mentor` | Guide for the mentor |
| `/404` | Friendly not-found page with the mascot |

Top navigation on every page: logo + site name (links to `/`), Map, Skills,
Glossary, Cheat sheets, theme toggle, XP pill. On phones the links collapse
into a menu button. Footer: one kind line, link to `/mentor`, "Reset my
progress" (asks to confirm first).

### `/` Quest map

- First visit: a welcome card asks "What should we call you, hero?" (text
  input, max 24 characters, optional — default "Hero"). Under it, three
  short lines: what this is, how long it takes, how it works. One button:
  "Start the quest".
- After that: greeting with name and mascot speech bubble, XP bar, streak,
  badges row, then the map.
- The map is one SVG: a winding path from bottom-left to top-right through a
  small illustrated landscape, with 8 level nodes and a boss castle at the
  end. Each node shows number, title, weeks, and state.
- Node states: `done` (filled, check mark, badge emoji), `current` (pulsing
  ring, mascot stands next to it), `ahead` (soft outline, small "peek" label).
- Clicking any node opens that level. Nothing is hard-locked: levels ahead
  can be read ("peek"), but the page shows a gentle banner: "You can read
  ahead — just finish Level N first before you tick things here." Ticking
  is disabled on levels ahead of the current one.
- On phones the map becomes a vertical path, same nodes.
- Below the map: "Today's next step" card — the first unticked mission of
  the current level, with a button to go there.
- "Share my progress" button: copies a link (see Share link).

### `/level/[id]`

Sections in this order, each with an anchor and an entry in a sticky side
table of contents (top chips on phones):

1. Header: level number, title, tagline, weeks, badge preview, progress ring.
2. **It's normal** box.
3. **Explain it**: the MDX body (prose, diagrams, analogy card).
4. **Play with it**: the widget(s) embedded in the MDX body.
5. **Missions**: cards with steps, a "How to check" line and a tick box.
6. **Break it on purpose**: cards with Do / You'll see / Why / Fix. The Why
   and Fix parts are hidden behind "Show me why" so she can guess first.
   Tick box "I broke it and fixed it".
7. **Classic traps**: table of error → what it really means → first move.
8. **Quiz**: "What does this error mean?" (see widgets spec).
9. **Deliverable**: three tick boxes — repo, one-page sketch, 10-minute demo.
10. **You're middle-level here when…**: self-check tick boxes.
11. **Go deeper**: links with one line each on why it's worth her time.
12. **Finish level** button. Enabled when all missions and all three
    deliverable boxes are ticked. On click: confetti, badge awarded, kind
    note revealed in a card, button to the next level. Once done, the kind
    note stays visible at the bottom of the page.
13. Previous / next level links, link to the level's cheat sheet.

### `/boss`

The final project brief from `levels.md`: story, requirements checklist
(tick boxes), architecture diagram, demo-day rubric table, "Finish the
quest" button (enabled when all requirement boxes are ticked). On finish:
big confetti, a certificate card with her hero name and the date, and a
"Print certificate" button (print CSS, one page).

### `/skills`

Skills matrix from `levels.md`. Eight skill areas (one per level). For each
area: three columns Junior / Growing / Middle with a short description, and
a 0–3 self-rating control (0 = not yet, 3 = middle). A radar chart (inline
SVG, 8 axes) shows her self-rating as a filled shape and the "middle"
target as an outline. Text under it: ratings are for her, not a grade.

### `/glossary`

Searchable list (client-side filter input). Each term: name, one plain
sentence, one analogy, level tag linking to the level.

### `/cheatsheets/[id]`

One printable page per level built from the level's `cheatsheet` list plus
its traps table. Print CSS: A4, no navigation, black on white, fits one page.

### `/mentor`

Content from `levels.md` → Mentor guide. No interactivity except that
opening a share link shows the learner's progress (below).

## Progress data

Stored in `localStorage` under the key `aiquest:v1`. All reads and writes go
through `src/lib/progress.ts`, wrapped in try/catch. If storage is not
available the site still works; progress just lasts for the page session
(keep it in memory) and a small note says so.

```ts
type LevelProgress = {
  missions: string[];   // ids ticked
  breaks: string[];     // ids ticked
  deliverable: ('repo' | 'sketch' | 'demo')[];
  selfCheck: number[];  // indexes ticked
  quizBest: number;     // best score, 0..n
  doneAt?: string;      // ISO date when "Finish level" was pressed
};

type Progress = {
  v: 1;
  hero: string;
  startedAt: string;                 // ISO date
  levels: Record<string, LevelProgress>;  // key "1".."8"
  boss: { items: string[]; doneAt?: string };
  skills: Record<string, 0 | 1 | 2 | 3>;  // key "1".."8"
  days: string[];                    // YYYY-MM-DD of days with any tick
  theme?: 'light' | 'dark';
};
```

Derived values (never stored):

- **Current level** = lowest level without `doneAt`; after level 8, the boss.
- **XP** = 20 per mission + 15 per break + 5 per self-check + 10 per quiz
  point (best score) + 100 per finished level + 500 for the boss.
- **Rank title** from XP: 0 "Brave Beginner", 300 "Curious Tinkerer",
  800 "Bug Tamer", 1500 "Reliable Builder", 2400 "Production Pal",
  3200 "Middle Engineer (unofficial but true)".
- **Streak** = number of consecutive days ending today or yesterday in
  `days`. If the streak is broken, show no guilt: "Welcome back! The map
  kept your place."
- **Badges** = one per finished level (name and emoji from the level file),
  plus: "First Step" (first tick ever), "Chaos Gremlin" (10 breaks ticked),
  "Quiz Wizard" (full score on any 4 quizzes), "Quest Complete" (boss done).

The store exposes a subscribe function so islands re-render on change, and
also listens to the `storage` event so two open tabs stay in step.

### Share link

"Share my progress" builds `<origin>/#p=<data>` where `data` is the
`Progress` object as JSON → UTF-8 → base64url. The hash is never sent to a
server.

When any page loads with `#p=` in the URL:

- Decode and validate (shape and version). If invalid, ignore it and show a
  small "That share link looks broken" note.
- Enter **view mode**: the whole site renders from the shared data, a
  sticky banner says "You're viewing <hero>'s map (read-only)" with an
  "Exit" button, all tick boxes are disabled, and nothing is written to
  localStorage. View mode is kept in `sessionStorage` so it survives
  navigation in that tab; "Exit" clears it.

### Reset

Footer link → confirm dialog built in HTML (do not use `window.confirm`):
"This clears your progress on this device. Sure?" → clears the key.

## Accessibility and quality bar

- Works with keyboard only; visible focus rings; tick boxes are real
  `<input type="checkbox">` elements with labels.
- Colour contrast AA in both themes.
- `prefers-reduced-motion`: no confetti burst (show a static sparkle
  instead), no pulsing, no animated paths.
- No layout shift when islands hydrate: islands render the same markup on
  the server with empty progress.
- Phone width 360px: no horizontal scroll anywhere. Code blocks scroll
  inside themselves.
- Every code block has a copy button.
- Lighthouse (local, desktop): performance ≥ 95, accessibility ≥ 95.
