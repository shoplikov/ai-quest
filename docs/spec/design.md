# Design spec

## Feeling

A hand-made adventure notebook. Warm paper, soft ink, bright stickers.
Rounded, friendly, a bit playful — but calm enough to read for an hour.
Think "illustrated field guide", not "game UI" and not "SaaS dashboard".

## Colour tokens

Define on `:root`. Dark values go under
`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }`
and again under `:root[data-theme="dark"]`. The theme toggle sets
`data-theme` on `<html>` and saves it in progress. Set the theme in a tiny
inline script in `<head>` so there is no flash.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--paper` | `#FFF8EE` | `#161A2B` | page background |
| `--card` | `#FFFFFF` | `#1F2540` | cards |
| `--card-2` | `#FFF1DC` | `#272E4F` | soft panels, "it's normal" box |
| `--ink` | `#2A2440` | `#F3EEE3` | main text |
| `--ink-soft` | `#5E5876` | `#B9B4CC` | secondary text |
| `--line` | `#E8DCC8` | `#343C63` | borders |
| `--coral` | `#FF6B5E` | `#FF8A7E` | primary action, current node |
| `--teal` | `#1FA89A` | `#4FD1C1` | success, done state |
| `--sun` | `#FFC53D` | `#FFD466` | XP, stars, highlights |
| `--lilac` | `#8E7CF0` | `#A99BFF` | links, widgets accent |
| `--sky` | `#4AA8FF` | `#7CC0FF` | info, diagrams |
| `--rose` | `#F06292` | `#FF8FB3` | kind notes |
| `--danger` | `#D64545` | `#FF7A7A` | error states in widgets |
| `--code-bg` | `#2A2440` | `#0F1220` | code blocks (always dark) |
| `--code-ink` | `#F3EEE3` | `#F3EEE3` | code text |

Text on `--coral` and `--teal` buttons is `#FFFFFF` in light theme and
`#161A2B` in dark theme. Check AA contrast for every text/background pair
you use and adjust a shade if one fails.

## Type

- Headings: **Fredoka Variable** (`@fontsource-variable/fredoka`), weight 600.
- Body: **Nunito Variable** (`@fontsource-variable/nunito`), weight 400/700.
- Code: **JetBrains Mono Variable** (`@fontsource-variable/jetbrains-mono`).
- Base size 17px, line height 1.65, measure max 70ch for prose.
- Scale: h1 2.4rem, h2 1.7rem, h3 1.25rem, small 0.9rem. Use `clamp()` so
  h1 shrinks to 1.9rem on phones.

## Shape, space, depth

- Radius: 18px cards, 12px inputs and buttons, 999px pills.
- Border: 2px solid `--line` on cards. Cards have a "sticker" shadow:
  `0 4px 0 var(--line)`. Primary buttons: `0 4px 0` in a darker shade of
  their colour; on press they move down 3px and the shadow shrinks.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 72px.
- Page gutter 16px on phones, content max-width 1080px; level pages are
  a 760px prose column plus a 220px sticky side contents list on desktop.

## Components

- **Card** — base surface. Variants: `soft` (`--card-2`), `note` (rose
  left border, used for kind notes), `warn` (sun left border).
- **Button** — primary (coral), success (teal), ghost (outlined).
- **Pill** — small rounded label: weeks, XP, level tag.
- **Tick row** — big 28px custom checkbox drawn over a real input; when
  ticked, the check mark draws itself (stroke animation, 250ms) and the
  label gets a soft teal highlight, not a strike-through.
- **Progress ring** — SVG circle, teal stroke, percentage in the middle.
- **XP bar** — sun-coloured fill, rank title on the left, next rank on the
  right, small star that hops when XP increases.
- **Speech bubble** — mascot lines.
- **Analogy card** — soft panel with a large emoji, a title ("Think of it
  like…") and the text.
- **Reveal** — "Show me why" disclosure used in break cards (`<details>`).
- **Code block** — dark, rounded, copy button top-right, language label.
  Use Astro's built-in Shiki highlighting with a dark theme.
- **Trap table** — on phones each row becomes a stacked card.
- **Toast** — small bottom-centre message ("+20 XP", "Link copied").
- **Dialog** — native `<dialog>` for reset confirm and badge award.

## Mascot: Porto the otter

An original character. A small round otter holding a tiny lantern (he
"shines a light on which port is open"). Name pun: Porto ↔ port.

- Flat vector, drawn as inline SVG, about 12 shapes: round body in warm
  brown `#B5794A`, cream belly and muzzle `#FFE9C9`, dot eyes, small round
  ears, short tail, lantern in `--sun` with a soft glow circle.
- Four moods as separate SVG components sharing one base: `hello`
  (waving), `thinking` (paw on chin), `cheer` (both paws up, lantern
  raised), `cozy` (eyes closed, smiling — used for "it's normal" boxes and
  the 404 page).
- He never scolds. Lines are short (max 12 words). Line pools live in
  `src/data/porto.ts`, picked by situation: first visit, returning after a
  break, mid-level, level done, all done. At least 6 lines per pool. Examples:
  - first visit: "Hi! I'm Porto. I know where every port goes."
  - returning: "Welcome back! The map kept your place."
  - mid-level: "One mission at a time. That's the whole trick."
  - level done: "You did that. Nobody did it for you."
  - quiz miss: "Good guess! This one tricks everybody."

## Quest map illustration

One inline SVG, viewBox 1000×640 (desktop) and a second 360×1100 layout
for phones. Draw with simple flat shapes in the palette:

- Background: paper colour with soft hills, a few clouds, tiny trees.
- Path: a dashed, rounded 10px stroke winding left-to-right and upward.
  The part already travelled is solid teal; the part ahead is dashed
  `--line`.
- Each level node sits on a small themed landmark:
  1 a campfire tent (terminal), 2 a row of little doors (ports), 3 a
  workshop with a chimney (backend), 4 a harbour with stacked boxes
  (Docker), 5 a library tower (data), 6 a lighthouse (LLM serving), 7 a
  big open book on a hill (RAG), 8 a launch pad with a small rocket (ship
  it). Boss: a castle with a flag.
- Node: 64px circle with the level number; label under it with title and
  a weeks pill. States as in the product spec.
- Every node is a real `<a>` with an `aria-label` like
  "Level 2: Networking and Ports, current level".

## Diagrams inside levels

Hand-drawn feel: 2.5px strokes, rounded caps and joins, slightly uneven
rectangles (rounded 10px), labels in Nunito, arrows with open heads. Use
palette tokens through `currentColor` and CSS variables so both themes
work. Each diagram is an Astro component in `src/components/diagrams/` and
has a `<title>` and `<desc>` for screen readers. Max width 720px, scales down.

## Motion

- Durations 150–300ms, ease-out. Path drawing on the map: 900ms once.
- Confetti: own small canvas implementation (no library), 120 pieces in
  palette colours, 1.8 seconds, then the canvas removes itself.
- Current node pulse: 2s loop, scale 1 → 1.08.
- All motion off under `prefers-reduced-motion: reduce`.

## Print

`@media print`: hide nav, footer, widgets, buttons; white background, black
text; code blocks get a light grey background with a border; links show
their URL after the text.
