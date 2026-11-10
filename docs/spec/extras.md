# Boss, skills, glossary, mentor guide

## Final boss — "Your own open book"

Route `/boss`. About 1 week (week 12). Landmark: castle.

**Story.** "You built the Otter Café service with a map in your hand. Now
build one without the map: a question-answering service over documents
*you* choose — something a real person would use. Team wiki pages, a
product manual, course notes, a public law or standard. Small is fine.
Real is the point."

**Requirements (tick boxes; ids `r1`…`r12`)**
- r1 A README a stranger can follow: what it is, how to run it, how to ask it something.
- r2 One command starts everything (`docker compose up -d`).
- r3 `/ask` answers with citations that point to the real source.
- r4 It says "I don't know" for questions the documents cannot answer.
- r5 Hybrid retrieval and a reranker — or a written reason, with numbers, why not.
- r6 A golden set of at least 30 questions and one command that prints the metrics.
- r7 A results history showing at least three measured improvements.
- r8 Schema managed by migrations; data in a named volume; a tested backup.
- r9 `/health`, `/ready`, structured logs with request ids, stage timings.
- r10 CI runs lint, tests and the image build on every push.
- r11 Deployed on a server, with a rollback you have practised.
- r12 A one-page runbook and a one-page architecture drawing.

**Architecture diagram** `boss-architecture`: user → nginx → API →
(Postgres+pgvector, Redis, LLM server), with the ingest path at the side
and the eval loop underneath.

**Demo day rubric** (table; mentor scores each 0–2, 14+ of 20 = quest complete)

| Area | 0 | 1 | 2 |
|------|---|---|---|
| Runs from README | needs help | small fixes needed | works first time |
| Answer quality | often wrong | mostly right | right, cited, honest refusals |
| Evaluation | none | numbers exist | numbers drove decisions |
| Retrieval design | copied | works | choices explained with evidence |
| Code structure | one file | organised | clean, tested, typed |
| Containers & data | fragile | works | healthchecks, volumes, backup proven |
| Observability | prints | logs | request story + timings + metrics |
| Deploy & rollback | by hand | scripted | scripted and rehearsed |
| Debugging live | stuck | finds it with hints | finds it alone, explains the hop |
| Explaining | unclear | clear | clear to a non-engineer too |

**Certificate text.** "This certifies that **<hero name>** crossed the
whole map — terminal, ports, backend, containers, data, models, retrieval
and production — and shipped a real service. Signed: Porto the Otter,
Keeper of Ports." Date = `boss.doneAt`.

**Kind note (boss).** "Look back at Level 1. The person who started
this was nervous about a black window. The person reading this deployed a
measured, monitored RAG service and rolled it back on purpose. Same
person. That distance is yours — nobody gave it to you, and nobody can
take it away."

---

## Skills page

Eight rows, one per level, built from each level file's `skill` block.
Column headers: "Junior", "Growing", "Middle". Rating labels: 0 "Not
yet", 1 "With help", 2 "Mostly alone", 3 "Alone, and I can explain it".
Radar target is 3 on every axis.

Intro text: "This page is for you, not for a review. Rate yourself
honestly today, and again in a month. The shape growing is the point."

Under the chart, "What 'middle' really means" — four lines:
- You finish things: from idea to running in production.
- You debug your own problems, hop by hop, before asking.
- You ask good questions, with what you tried and what you saw.
- People can build on your work without calling you.

---

## Glossary (`src/content/glossary.yaml`)

Fields: `term`, `plain`, `analogy`, `level`. Write all of these:

| term | plain | analogy | level |
|------|-------|---------|-------|
| Terminal | A window where you type commands instead of clicking. | Texting your computer. | 1 |
| Process | A program that is running right now. | A person currently in the house. | 1 |
| PID | The number the system gives each process. | A ticket number at the bakery. | 1 |
| PATH | The list of folders where the shell looks for commands. | The drawers you check for scissors. | 1 |
| SSH | A secure way to use another computer's terminal. | A long, locked corridor to another house. | 1 |
| tmux | A terminal session that keeps running when you leave. | A room that stays lit. | 1 |
| IP address | The number that identifies a machine on a network. | The street address of a building. | 2 |
| Port | A number that picks one program on a machine. | A numbered door in the building. | 2 |
| localhost / 127.0.0.1 | "This same machine." | The building's intercom. | 2 |
| 0.0.0.0 | "Listen on every network entrance." | Every door to the street. | 2 |
| DNS | The system that turns names into IP addresses. | Your phone's contact list. | 2 |
| Firewall | Rules for which ports may be reached from where. | The guard at the entrance. | 2 |
| Reverse proxy | A server that receives requests and passes them to apps. | The receptionist. | 2 |
| SSH tunnel | A private path from your port to a port on another machine. | A secret corridor. | 2 |
| API | A set of rules for how programs ask each other for things. | A restaurant menu. | 3 |
| Endpoint | One address in an API that does one job. | One dish on the menu. | 3 |
| Status code | A number that says how the request went. | The waiter's face. | 3 |
| Validation | Checking input before using it. | The waiter reading back your order. | 3 |
| Event loop | The single worker that runs all `async` code in turn. | One waiter, many tables. | 3 |
| Environment variable | A setting given to a program from outside its code. | A note on the fridge. | 3 |
| Image | A packed, read-only template of an app and all it needs. | The recipe and the packed box in the freezer. | 4 |
| Container | A running copy of an image. | One lunchbox, opened. | 4 |
| Volume | Storage that lives outside the container. | A shelf in the real kitchen. | 4 |
| Compose | A file that describes several containers that work together. | A seating plan for lunchboxes. | 4 |
| Healthcheck | A small test that says whether a service is working. | "Is the oven on?" | 4 |
| Migration | A versioned change to the database structure. | A page in the building's renovation diary. | 5 |
| Index | A structure that lets the database find rows quickly. | The library catalogue. | 5 |
| Embedding | A list of numbers that stands for the meaning of a text. | A pin on a map of meaning. | 5 |
| Vector search | Finding texts whose embeddings are close to the question's. | "Show me pins near this pin." | 5 |
| Cache | A fast, temporary store for answers you already computed. | Sticky notes on the monitor. | 5 |
| Token | A piece of text the model reads or writes; a word is one or a few. | A bite. | 6 |
| Context window | The most tokens the model can handle in one call. | The chef's table. | 6 |
| Streaming | Sending the answer piece by piece as it is made. | Serving dishes as they are ready. | 6 |
| Temperature | How much randomness the model uses when choosing words. | How adventurous the chef feels. | 6 |
| Structured output | Making the model answer in a fixed, checkable format. | A form instead of a free letter. | 6 |
| RAG | Giving the model retrieved documents to answer from. | An open-book exam. | 7 |
| Chunk | A piece of a document stored and searched as one unit. | One page handed to the student. | 7 |
| Hybrid search | Combining meaning search and keyword search. | Asking both the librarian and the catalogue. | 7 |
| Reranker | A model that re-orders retrieved chunks by real relevance. | A second, pickier helper. | 7 |
| Golden set | Fixed questions with known answers, used to measure quality. | The answer key. | 7 |
| Hit rate@k | How often the right chunk is in the top k results. | "Did the helper bring the right page?" | 7 |
| Faithfulness | Whether every claim in the answer is supported by the sources. | "Is it in the book, or made up?" | 7 |
| CI | Automatic checks that run on every push. | A robot reviewer who never sleeps. | 8 |
| Rollback | Going back to the previous working version. | Yesterday's menu. | 8 |
| p95 latency | The time within which 95% of requests finish. | How long the unlucky customers wait. | 8 |
| Runbook | A page that says how to operate a service. | The café's opening checklist. | 8 |

---

## Mentor guide (`/mentor`)

Write this page for the mentor, in the same kind voice.

**Your job in one line.** You are not the teacher; the map is. You are
the person who makes it safe to be stuck and worth it to finish.

**Before she starts**
- Give her: a Linux machine she may break, SSH access to one remote
  machine, and an LLM endpoint (or tell her to use Ollama).
- Agree on time: about 6–8 hours a week, some of it inside work hours.
- Say out loud that getting stuck is the plan, not a problem.

**The weekly 30 minutes**

| Minutes | What |
|---------|------|
| 0–5 | How was the week? One thing that felt good, one that felt bad. |
| 5–15 | She demos. You watch and stay quiet. |
| 15–22 | You ask "why" three times. ("Why 0.0.0.0?" "What if the db is down?") |
| 22–27 | Review one piece of her work together: a file, a diagram, a log. |
| 27–30 | Agree the one goal for next week. She writes it down. |

**How to review**
- Start with what is right, specifically. "Your `/ready` checks the real
  dependency — good."
- Then one main thing to improve. One. The rest can wait.
- Ask before telling: "What would happen if…?" beats "You should…".
- Praise the process ("you checked `ss` first") more than the result.

**The 30-minute rule (tell her this on day one)**
Stuck? Try for 30 minutes. Write down what you tried and what you saw.
Then ask — with those notes. Asking with notes is a senior habit, not a
weakness.

**When she asks for help**
Do not take the keyboard. Ask, in order: What did you expect? What
happened instead? What is the exact error? Which hop is it? Usually the
answer arrives during the second question.

**Signs she is becoming middle-level**
- She tells you the cause, not only the symptom.
- Her questions contain what she already ruled out.
- She says "I measured it" instead of "I think".
- She writes things down without being asked.
- Other people start asking her.

**Pace**
- The weeks are a guide. Level 7 often takes four weeks; that is fine.
- If a level drags past double its time, cut the last mission, do the
  deliverable, move on. Momentum matters more than completeness.
- If she is flying, add: "explain this level to another junior".

**After the boss**
Give her a real, small production task with her name on it. The map was
practice; ownership is the graduation.

**Seeing her progress.** She can press "Share my progress" on the map and
send you the link. It opens her map read-only in your browser. Nothing is
stored on any server.

---

## Home page copy

- Title: "AI Engineer Quest"
- Subtitle: "From 'why is the port closed?' to 'I shipped it.' One level at a time."
- Welcome card lines: "Eight levels and a final boss." · "About twelve
  weeks, at your pace." · "Each level: understand it, play with it, build
  it, break it, fix it."
- Small print under the name field: "Stays in this browser. No account."
- Footer line: "Made with care. Breaking things is part of the plan."
- 404: Porto (cozy mood): "This port is closed. Let's go back to the map."
