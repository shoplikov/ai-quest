# Widget spec

All widgets are Preact islands in `src/components/widgets/`, hydrated with
`client:visible`. Each one:

- works with keyboard and touch;
- has a one-line instruction at the top and a "Try this" list of 2–3
  suggested experiments under it;
- keeps its logic in a pure function in `src/lib/` with unit tests
  (Vitest), separate from the view;
- stores nothing in progress except the quiz.

---

## 1. Port playground (Levels 2 and 4)

Shows why a request reaches an app or not.

### Controls

| Control | Values | Default |
|---------|--------|---------|
| Where the app runs | `on the machine` / `in a Docker container` | on the machine |
| App listens on address | `127.0.0.1` / `0.0.0.0` | `127.0.0.1` |
| App listens on port | number 1–65535 | 8000 |
| Published port (Docker only) | none / `-p HOST:CONTAINER` with optional host IP `127.0.0.1` | `-p 8080:8000` |
| Who is calling | `same machine` / `another machine on the network` | same machine |
| Port the caller uses | number | 8000 |
| Firewall lets that port in | yes / no | yes |

Show the matching commands live under the controls, for example:

```
uvicorn app:app --host 0.0.0.0 --port 8000
docker run -p 8080:8000 my-app
curl http://192.168.1.20:8080
```

Use the example address `192.168.1.20` for "the machine" and `localhost`
when the caller is on the same machine.

### Picture

Left: caller (laptop icon). Middle: the machine drawn as a building with
doors (ports); in Docker mode a lunchbox (container) sits inside the
building with its own small door. A dot (the request) travels along the
path and either arrives (teal, small sparkle) or stops at the exact point
of failure (red, small bump), with the result text under the picture.

### Logic — `evaluatePort(config): Result`

`Result = { ok: boolean, stopAt: 'firewall' | 'host-port' | 'publish' | 'container-app' | 'app' | null, error: string | null, why: string, fix: string | null }`

Evaluate in this order and return the first match.

**App on the machine**

1. Caller is another machine and firewall = no →
   stopAt `firewall`, error `curl: (28) Connection timed out`,
   why "The firewall dropped the request silently. Nobody answered, so
   curl waited until it gave up.", fix "Allow the port in the firewall or
   security group."
2. Caller port ≠ app port →
   stopAt `host-port`, error `curl: (7) Failed to connect … Connection refused`,
   why "Nothing is listening on that port. The machine answered at once:
   'nobody lives at this door'.", fix "Call the port the app listens on."
3. Caller is another machine and app address = `127.0.0.1` →
   stopAt `host-port`, error `curl: (7) … Connection refused`,
   why "The app only answers the door for callers on the same machine.
   From outside, that door does not exist.", fix "Listen on 0.0.0.0."
4. Otherwise → ok, stopAt `null`, why "Right address, right port, door open."

**App in a Docker container**

1. Caller is another machine and firewall = no → same as rule 1 above.
2. No published port →
   stopAt `host-port`, `Connection refused`,
   why "The container has its own private network. With no `-p`, the
   machine has no door that leads to it.", fix "Publish a port with -p."
3. Caller port ≠ published HOST port → stopAt `host-port`,
   `Connection refused`, why "The door on the machine is the HOST port —
   the left number in -p.", fix "Call the HOST port."
4. Publish has host IP `127.0.0.1` and caller is another machine →
   stopAt `host-port`, `Connection refused`,
   why "The published door is only open to the machine itself.",
   fix "Publish without 127.0.0.1 if outsiders must reach it."
5. Published CONTAINER port ≠ app port →
   stopAt `publish`, error `curl: (56) Recv failure: Connection reset by peer`,
   why "Docker opened the door on the machine and walked your request to
   the container — but nothing listens on that container port.",
   fix "Make the right number in -p equal the port the app listens on."
6. App address = `127.0.0.1` →
   stopAt `container-app`, error `curl: (56) Recv failure: Connection reset by peer`
   (note under it: "sometimes shown as `(52) Empty reply from server`"),
   why "Inside a container, 127.0.0.1 means the container itself. Requests
   from Docker come from outside the container, so the app ignores them.",
   fix "Inside containers, always listen on 0.0.0.0."
7. Otherwise → ok.

### Try this

- "Make it fail with `Connection refused` in two different ways."
- "Docker mode: reach the app from another machine."
- "Find the setup where the app is healthy but you get `Connection reset`."

### Tests

One unit test per rule above, plus the two success cases.

---

## 2. Request journey (Levels 2 and 3)

A stepper that walks one request: `https://quest.example.com/ask`.

Stations, left to right: Browser → DNS → Firewall → nginx (port 443) →
App (port 8000) → Database (port 5432) → and back.

Controls: Back / Next / Play (auto-advance every 1.6s) / Restart.

Each step highlights one station and one arrow, moves a dot, and shows a
caption:

1. Browser: "I need quest.example.com. Where does it live?"
2. DNS: "It lives at 203.0.113.10." (name → IP)
3. Browser → Firewall: "Knocking on 203.0.113.10, port 443." Firewall:
   "443 is on the list. Come in."
4. nginx: "I hold the HTTPS certificate. I pass /ask to the app on
   127.0.0.1:8000." (reverse proxy)
5. App: "I need data. Asking the database on port 5432."
6. Database: "Here are your rows."
7. App → nginx → Browser: "200 OK, here is your answer."
8. Summary card: "Seven hops. When something breaks, find which hop."

Under the stepper: "Where would it break?" — five buttons (DNS wrong,
firewall closed, nginx down, app down, database down). Pressing one marks
the failing station red and shows the error a user would see:
`Could not resolve host` / timeout / `Connection refused` /
`502 Bad Gateway` / `500 Internal Server Error`, each with a one-line reason.

---

## 3. Dockerfile layer stacker (Level 4)

Teaches build cache order.

Six draggable lines (also movable with up/down buttons for keyboard):

```
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

Costs in seconds for a full build: FROM 8 (pull), WORKDIR 0, COPY
requirements 0, RUN pip 45, COPY . . 1, CMD 0.

Scenario buttons: "I changed `app.py`" / "I added a package to
`requirements.txt`" / "Nothing changed".

`simulateBuild(order, change)` returns per line `cached | rebuilt | error`
and total seconds:

- A line is rebuilt if it is the first line whose input changed, or any
  line after a rebuilt line. Otherwise cached (0s).
- `COPY requirements.txt .` input changes on the requirements scenario.
- `COPY . .` input changes on both the app.py and requirements scenarios.
- Validity: `FROM` must be first (else error "A Dockerfile starts with
  FROM."). `RUN pip install` before any COPY that brings in
  `requirements.txt` → error "pip can't find requirements.txt — it has not
  been copied in yet." `COPY . .` also brings in requirements.txt.

Display: stacked layer bars, teal "CACHED" or coral "REBUILT 45s", total
time large at the bottom, and a verdict line:

- Good order + app.py change → about 1s: "Only your code layer rebuilt.
  This is the order you want."
- `COPY . .` above `RUN pip install` + app.py change → 46s: "One changed
  line of code reinstalled every package. Copy requirements first."

Starting order is the bad one (`COPY . .` before pip) so the learner fixes it.

---

## 4. Chunking visualiser (Level 7)

A fixed sample text of about 1,200 characters (write a short, fun,
invented "Otter Café staff handbook" with 5 short paragraphs, including one
fact split over two sentences: "Refunds are allowed within 14 days. After
that, only store credit is given, and only with a receipt.").

Controls: strategy `fixed size` / `by sentence` / `by paragraph`; chunk
size 100–600 characters (step 20); overlap 0–50% (step 5; disabled for
paragraph strategy).

`chunk(text, strategy, size, overlap)` returns `[{start, end}]`:

- fixed: windows of `size`, step `size × (1 − overlap)`.
- by sentence: pack whole sentences until adding one would pass `size`;
  overlap repeats the last sentences of the previous chunk up to
  `size × overlap` characters.
- by paragraph: one chunk per paragraph.

Display: the text with each chunk as an alternating coloured background;
overlap regions striped. Stats: number of chunks, average length.

Question box (fixed): "What happens to a refund after 14 days?" Highlight
the two answer sentences. Verdict:

- both sentences inside at least one single chunk → teal "A chunk holds the
  whole answer."
- otherwise → coral "The answer is cut in half. The retriever may find one
  half and the model will guess the rest."

Try this: fixed size 120 with 0 overlap (cut); raise overlap until it
heals; switch to by sentence.

---

## 5. RAG pipeline walkthrough (Level 7)

Horizontal row of stage cards (vertical on phones). Click or arrow keys to
select; a detail panel shows "Goes in", "Comes out", "Can go wrong" for
that stage, using one running example (the Otter Café handbook, question
"Can I get my money back after three weeks?").

Stages and their fixed example data:

1. **Question** — in: user text. Out: same text. Wrong: vague questions.
2. **Rewrite** — out: "refund policy after 14 days". Wrong: rewriting
   drops a key detail.
3. **Embed** — out: a vector (show 8 numbers and "…1024 total"). Wrong:
   a different embedding model than the one used for the documents.
4. **Retrieve** — two lists side by side: vector search top 4 and keyword
   (BM25) search top 4, with scores. Wrong: the right chunk is not in
   either list — nothing later can fix that.
5. **Fuse** — one merged list (reciprocal rank fusion). Wrong: duplicates.
6. **Rerank** — reordered top 3 with new scores; the correct chunk moves
   to place 1. Wrong: slow if you rerank too many.
7. **Build prompt** — show the final prompt: instructions, the 3 chunks
   with `[1] [2] [3]` labels, the question. Wrong: too many chunks, the
   model loses the answer in the middle.
8. **Generate** — answer: "After 14 days you can only get store credit,
   and you need a receipt [1]." Wrong: answer not supported by the chunks.
9. **Check** — evaluation: was the right chunk retrieved (yes), is the
   answer supported by it (yes), does it cite it (yes).

A toggle "Break retrieval" removes the correct chunk at stage 4; stages
7–9 then show a confident wrong answer and red marks at stage 9, with the
caption "The model was not the problem. Retrieval was."

---

## 6. Error quiz (every level)

Data comes from the level file's `quiz` list.

- One question at a time: optional code block with an error, a question,
  3–4 answer buttons.
- After a choice: mark right/wrong, show the `why` text, Porto reacts
  (cheer / kind line), "Next" button.
- End screen: score, best score saved to `levels[id].quizBest` (only if
  higher), "Try again" button. Wrong answers never subtract anything.
- Disabled saving in view mode.

---

## 7. Small shared pieces

- **Confetti** — see design spec.
- **CopyButton** — on every code block; shows "Copied!" for 1.5s.
- **RadarChart** — pure SVG, props: `values: number[8]`, `target: number[8]`,
  `labels: string[8]`.
