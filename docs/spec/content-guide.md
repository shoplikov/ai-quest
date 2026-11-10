# Content guide

## Voice

Write like a kind senior colleague who remembers being confused.

- Speak to her directly: "you". Short sentences. Plain words.
- Explain the idea before the command. Then give the command. Then say
  what she should see.
- One analogy per idea, taken from daily life. Keep the same analogy
  through the level (ports are always doors; a container is always a
  lunchbox).
- Funny is welcome when it is about the technology: "The error says
  'connection refused'. Rude, but honest."
- Never: "simply", "just", "obviously", "easy", "as everyone knows".
- Never joke about the learner, her level, or mistakes she might make.
- Normalise struggle with facts, not flattery: "Every engineer has lost an
  hour to a wrong port. Most have lost a day."
- Be exact. Real commands, real error text, real flags. If you are not
  sure a command is right, check the docs before writing it.
- Examples use neutral names: `my-app`, `quest-api`, `example.com`,
  `192.168.1.20`, `203.0.113.10`. Never real hosts or company names.
- Commands assume Linux (Ubuntu) and Python 3.12. If a command needs
  `sudo`, show it.

## Level file

One file per level and language: `src/content/levels/en/<id>-<slug>.mdx`
and `src/content/levels/ru/<id>-<slug>.mdx`. The two `2-ports.mdx` files
are the finished examples. Match their depth. The Russian voice, terms
and the structure both files must share are in `docs/spec/i18n.md`.

### Frontmatter schema

Validate with a Zod schema in the content config. All fields required
unless marked optional.

```yaml
id: 2                      # 1..8
slug: ports
title: "Networking & Ports"
tagline: "one line, max 90 chars"
weeks: 1                   # number, may be 0.5 steps
landmark: doors            # which map landmark (see design spec)
badge: { name: "Port Whisperer", emoji: "🚪" }
skill:                     # used on /skills
  name: "Networking"
  junior: "one sentence"
  growing: "one sentence"
  middle: "one sentence"
itsNormal: "2–3 sentences"
analogy: { emoji: "🚪", title: "…", text: "…" }
missions:                  # 3–6
  - id: m1
    title: "…"
    why: "one sentence — what this teaches"
    steps: ["markdown string", "…"]   # may contain `inline code` and fenced blocks
    check: "How she knows she did it"
breaks:                    # 3–4
  - id: b1
    title: "…"
    do: "markdown"
    see: "exact error text"
    why: "markdown"
    fix: "markdown"
traps:                     # 4–8
  - error: "exact text"
    meaning: "plain sentence"
    firstMove: "command or action"
deliverable:
  repo: "what the repo must contain"
  sketch: "what the one-page drawing must show"
  demo: "what to show the mentor in 10 minutes"
selfCheck: ["I can …", "…"]          # 4–5
quiz:                      # exactly 5
  - q: "…"
    code: "optional error text"
    options: ["…", "…", "…"]
    answer: 0              # index
    why: "…"
links:                     # 3–5
  - { title: "…", url: "https://…", why: "one line" }
cheatsheet:                # 8–14 rows
  - { cmd: "ss -tlnp", does: "Show which ports are open and who owns them" }
kindNote: "3–5 sentences, shown when the level is finished"
```

### Body (MDX)

The body is the **Explain it** and **Play with it** part. Structure:

1. An opening of 2–4 sentences: the everyday problem this level solves.
2. 4–7 short sections with `##` headings. Each one: idea → picture or
   analogy → command → what you should see.
3. Diagram components where a picture helps: `<Diagram name="…" />`.
4. The analogy card once, near the top: `<Analogy />` (reads frontmatter).
5. The widget(s), each introduced by one sentence:
   `<PortPlayground client:visible />`.
6. A closing 2–3 sentence recap: "What to remember".

Length of body: 600–1,000 words. The missions teach the rest.

### Missions

- Each mission is 20–60 minutes of hands-on work.
- Steps are things to type and observe, not things to read.
- The check is something she can see on her own screen.
- Missions build on each other inside a level and reuse earlier levels'
  repos where possible (the FastAPI app from Level 3 is put in Docker in
  Level 4, gets a database in Level 5, and so on up to the boss).

### Breaks

Safe, local, reversible. Never anything that could harm a shared server or
lose data. Each break ends with the system working again.

### Kind notes

Specific to what she just achieved. No generic "you're amazing". Say what
she can now do that she could not do before, and why that matters.
Example (Level 2): see the two `2-ports.mdx` files.

## Links

Only free, stable, high-quality sources: official docs, well-known free
guides. Check that every URL returns 200 at build time (see build guide).
If one is dead, replace it with the closest official page.
