# Level facts (source of truth)

Level 2 is already written in full, in both languages:
`src/content/levels/en/2-ports.mdx` and `src/content/levels/ru/2-ports.mdx`.
Every level below must also be written in both. Write the English file
first, then the Russian one following `docs/spec/i18n.md`.
This file gives the facts for levels 1 and 3–8. Turn each into a level file
with the same schema, depth and voice as Level 2. Write full sentences and
full mission steps; the notes here are compressed.

Do not add technical claims that are not here without checking official docs.

## The running project

Levels 3–8 build one service step by step, in one repo called `quest-api`:
a small question-answering API for the invented **Otter Café staff
handbook**. Each level adds a layer:

| Level | Adds |
|-------|------|
| 3 | FastAPI app: `/health`, `/ask` (fake answer), tests |
| 4 | Dockerfile + compose |
| 5 | Postgres + pgvector + Redis in compose, migrations |
| 6 | Real LLM calls, streaming, structured output |
| 7 | Real RAG: ingest, hybrid retrieval, rerank, citations, evals |
| 8 | Logs, metrics, CI, deploy, runbook |

The boss project is the same shape, on documents the learner chooses.

**Model access.** The learner needs an OpenAI-compatible chat endpoint and an
embedding model. Say this at the start of Level 6: "Ask your mentor which
endpoint to use. If there is none, run a small model on your laptop with
Ollama, which serves an OpenAI-compatible API at
`http://localhost:11434/v1`." For embeddings on a laptop:
`sentence-transformers` with `intfloat/multilingual-e5-small` (384
dimensions, runs on CPU).

---

## Level 1 — Terminal & Linux

- slug `terminal`, weeks 1, landmark `tent`, badge "Shell Sherpa" 🏕️
- tagline: "The black window is not angry at you. It is waiting politely."
- skill "Linux & terminal" — junior: "I paste commands and hope." growing:
  "I move around, read logs and manage processes." middle: "On an
  unfamiliar server I find what runs, where it logs and why it stopped."
- itsNormal: the terminal gives no hints and no undo, so it feels hostile.
  It is only quiet. Everybody looks up `tar` flags, forever.
- analogy 🏠 "The server is a house with the lights off": `pwd` = which
  room am I in, `ls` = switch on the light, `cd` = walk to another room,
  logs = the house diary, processes = the people currently in the house.

**Body sections**
1. Where am I: `pwd`, `ls -la`, `cd`, absolute vs relative paths, `~`, `.`, `..`. Diagram `file-tree`.
2. Reading files: `cat`, `less`, `head`, `tail -n 50`, `tail -f` (watch a log live).
3. Finding things: `grep -rn "text" .`, `find . -name "*.py"`, pipes `|`:
   `ps aux | grep python`. Diagram `pipe` (output of one command flows into the next).
4. Who may do what: `ls -l` columns, `rwx` for owner/group/others,
   `chmod +x script.sh`, `sudo` = "ask as the building manager". Diagram `permissions`.
5. Processes: `ps aux`, `htop`, PID, `kill <pid>` (polite), `kill -9 <pid>`
   (last resort), background with `&`, why a process dies when SSH closes,
   `tmux` as "a room that stays lit when you leave".
6. Machine health: `df -h` (disk), `du -sh *` (what is big), `free -h`
   (memory), `nvidia-smi` (GPU, if the machine has one).
7. Environment: `export NAME=value`, `echo $NAME`, `env`, `$PATH` and
   `which python` — why "command not found" happens.
8. Other machines: `ssh user@host`, key pairs (public = lock you hand out,
   private = key you keep), `~/.ssh/config` shortcuts, `scp file host:path`.
9. Services: `systemctl status <name>`, `journalctl -u <name> -f`.

No widget besides the quiz.

**Missions**
- m1 "Treasure hunt": make `~/quest/level1/{notes,logs,scripts}`; create a
  file with `echo "hello" > notes/first.txt`; append with `>>`; find it
  with `find ~ -name first.txt`; find the word with `grep -rn hello ~/quest`.
  check: `find` and `grep` both print the path.
- m2 "Watch a log live": write `scripts/ticker.sh`:
  ```bash
  #!/usr/bin/env bash
  while true; do echo "$(date +%T) tick" >> ~/quest/level1/logs/ticker.log; sleep 2; done
  ```
  `chmod +x`, run it with `&`, watch `tail -f logs/ticker.log`, find it
  with `ps aux | grep ticker`, stop it with `kill <pid>`.
  check: the log stops growing after `kill`.
- m3 "A room that stays lit": `tmux new -s quest`, start the ticker
  inside, detach `Ctrl+b` then `d`, close the terminal, open a new one,
  `tmux attach -t quest` — still running. `tmux ls`, `tmux kill-session -t quest`.
  check: the ticker survived closing the terminal.
- m4 "Keys, not passwords": `ssh-keygen -t ed25519`; `ssh-copy-id user@host`
  to a machine the mentor provides; add a `Host` block in `~/.ssh/config`;
  connect with the short name; copy a file there with `scp`.
  check: `ssh <shortname>` logs in with no password prompt.
- m5 "Health check of a machine": on that machine write `REPORT.md`
  answering with commands: how full is the disk, what are the 3 biggest
  folders in your home, how much memory is free, which 3 processes use the
  most memory (`ps aux --sort=-%mem | head -4`), what was the last line in
  the system journal (`journalctl -n 1`).
  check: every answer has the command next to it.

**Breaks**
- b1 "Not allowed": create `hello.sh`, run `./hello.sh` without chmod →
  `bash: ./hello.sh: Permission denied`. why: no execute bit. fix: `chmod +x`.
- b2 "Lost command": `mytool` → `mytool: command not found`. why: the shell
  looks only in folders listed in `$PATH`. fix: `./mytool` with a path, or
  install it, or check `which`.
- b3 "Wrong room": `cat notes/first.txt` from `/tmp` → `No such file or
  directory`. why: relative paths start from where you stand (`pwd`).
  fix: `cd` there or use the absolute path.
- b4 "The vanishing job": start the ticker over SSH without tmux, close the
  window, reconnect — it is gone. why: closing the session ends its
  processes. fix: tmux (Mission 3).

**Traps** (error → meaning → first move)
- `Permission denied` → you lack the right for that file or action → `ls -l` the file; do you need `chmod` or `sudo`?
- `command not found` → not installed, or not on `$PATH` → `which <name>`; `echo $PATH`
- `No such file or directory` → wrong path or wrong folder → `pwd`, then `ls`
- `Permission denied (publickey)` → the server does not know your key, or wrong user → `ssh -v host`; check `IdentityFile` and user
- `No space left on device` → disk full → `df -h`, then `du -sh * | sort -h` in the biggest mount
- "I pressed something and the terminal froze" → probably `Ctrl+s` (pause) → press `Ctrl+q`

**Deliverable** repo `quest-level-1` with `ticker.sh`, `REPORT.md`, your
`~/.ssh/config` block (no keys!); sketch: the folder tree of a server you
explored, with where code, logs and config live; demo: on a machine you
have not seen before, answer in 5 minutes "what runs here and where does
it log?".

**selfCheck** I move around without a file manager. / I read a live log
with `tail -f` and filter it with `grep`. / I find and stop a process by
PID. / I keep long jobs in tmux. / I connect to servers with keys and a
config shortcut.

**Quiz**
1. `bash: ./run.sh: Permission denied` → file is not executable (`chmod +x`) ✔ / file missing / need to reinstall bash. why: the file exists; it lacks the execute bit.
2. You started training over SSH and closed the laptop; job died. What prevents it? → run it inside tmux ✔ / add more RAM / use `sudo`. why: tmux keeps the session alive on the server.
3. `No space left on device` — first command? → `df -h` ✔ / `rm -rf /tmp/*` / reboot. why: look before you delete.
4. `kill 4242` did nothing. Next? → `kill -9 4242`, knowing it gives the program no chance to clean up ✔ / reboot / `kill 4242` ten more times. why: plain kill asks politely; -9 forces.
5. `python: command not found` but Python is installed. Likely? → its folder is not on `$PATH` (or the name is `python3`) ✔ / Python is broken / wrong password. why: the shell only searches `$PATH`.

**Links** The Missing Semester — https://missing.csail.mit.edu/ (free
MIT course on exactly this) · explainshell — https://explainshell.com/ ·
tmux cheat sheet — https://tmuxcheatsheet.com/ · Ubuntu command line for
beginners — https://ubuntu.com/tutorials/command-line-for-beginners

**Cheatsheet** `pwd`, `ls -la`, `cd -` (back to previous folder),
`tail -f file`, `grep -rn "x" .`, `find . -name "*.log"`, `chmod +x f`,
`ps aux | grep name`, `kill <pid>`, `df -h`, `du -sh * | sort -h`,
`free -h`, `tmux new -s name` / `tmux attach -t name`, `journalctl -u svc -f`.

**kindNote** idea: the black window is now a place the learner can walk
around in with the lights on. Every later level happens in this house; they
will never again be the person who is afraid to SSH into a server.

---

## Level 3 — Backend with FastAPI

- slug `backend`, weeks 2, landmark `workshop`, badge "Endpoint Artisan" 🛠️
- tagline: "Turn a Python function into something the whole network can call."
- skill "Backend" — junior: "I write scripts and notebooks." growing: "I
  build endpoints that validate input and return clear errors." middle:
  "I design a small service others can use without asking me questions."
- itsNormal: a script runs once and ends; a service runs for months and
  talks to strangers. That is a different way of thinking and it takes a
  few weeks to settle.
- analogy 🍽️ "An API is a restaurant": the menu is the list of endpoints,
  an order is a request, the waiter checks the order is on the menu
  (validation), the kitchen is your code, the plate is the response, and
  status codes are the waiter's face — 200 smile, 404 "we don't serve
  that", 422 "I can't read your order", 500 "the kitchen is on fire".

**Body sections**
1. Request and response: method, path, headers, body; JSON. Diagram `request-response`.
2. First app:
   ```python
   from fastapi import FastAPI
   app = FastAPI()

   @app.get("/health")
   def health():
       return {"status": "ok"}
   ```
   Setup: `python3 -m venv .venv && source .venv/bin/activate`,
   `pip install "fastapi[standard]"`, run `fastapi dev main.py`, open `/docs`.
3. Validation with Pydantic: a `BaseModel` for the request body; a wrong
   body gives **422** with a `detail` list that says exactly which field.
4. Status codes that matter: 200, 201, 400, 401, 404, 422, 500;
   `raise HTTPException(status_code=404, detail="…")`.
5. `async def` vs `def`: the event loop is one waiter serving many tables.
   If he stands and waits at one table (blocking call inside `async def`),
   everybody waits. Rule: `async def` only with `await`-able calls; plain
   `def` for blocking code (FastAPI runs it in a thread pool). Diagram `event-loop`.
6. Config: settings from environment variables with `pydantic-settings`
   (`BaseSettings`), a `.env` file, `.env` in `.gitignore`. Never secrets in code.
7. Logging: `logging` not `print`; log one line per request with method,
   path, status, duration; a request id.
8. Structure: `app/main.py`, `app/routers/`, `app/schemas.py`,
   `app/services/`, `app/config.py`, `tests/`. Diagram `project-layout`.
9. Tests: `pytest` with `fastapi.testclient.TestClient`.
10. Running for real: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
    (connect back to Level 2: why `0.0.0.0`).

Widget: `<RequestJourney client:visible />` again, with one sentence:
"You are now building the 'App' station."

**Missions**
- m1 "Hello, service": create `quest-api`, venv, `/health`, run with
  `fastapi dev`, call with `curl` and from `/docs`. check: `curl -s
  localhost:8000/health` prints `{"status":"ok"}`.
- m2 "Take an order": `POST /ask` with body model
  `AskRequest(question: str = Field(min_length=3, max_length=500), top_k: int = Field(default=5, ge=1, le=20))`
  and response model `AskResponse(answer: str, sources: list[str])`.
  Return a fake answer for now. Send a good body, then an empty question,
  then `top_k: 100`; read each 422. check: `/docs` shows both models; bad
  input gives 422 naming the field.
- m3 "Config and secrets": `Settings(BaseSettings)` with `app_name`,
  `log_level`, `llm_base_url`; read from `.env`; add `.env.example`
  without secrets; `.gitignore` has `.env`. check: changing `.env` changes
  behaviour without touching code; `git status` never shows `.env`.
- m4 "Leave a trail": logging middleware — one log line per request with
  method, path, status, duration in ms and a generated request id that is
  also returned in an `X-Request-ID` header. check: every curl call
  produces one log line; the header matches the log.
- m5 "Prove it works": tests for `/health`, a valid `/ask`, an invalid
  `/ask`. Run `pytest -q`. check: 3 tests pass; break the code on purpose
  and see one fail.

**Breaks**
- b1 "Freeze the waiter": add
  ```python
  @app.get("/slow")
  async def slow():
      time.sleep(5)
      return {"done": True}
  ```
  Call `/slow` and at once `/health` in another terminal → `/health`
  waits 5 s. why: a blocking call inside `async def` blocks the whole
  event loop. fix: `await asyncio.sleep(5)`, or make the function plain `def`.
- b2 "Unreadable order": send `{"question": 42}` → 422 with
  `"Input should be a valid string"`. why: validation protects the
  kitchen. fix: send a string — and notice the error told you exactly what.
- b3 "Kitchen fire": raise `ZeroDivisionError` inside `/ask` → client sees
  `500 Internal Server Error`, the terminal shows the traceback. why: the
  client gets no details on purpose. fix: read the traceback from the
  bottom line up; handle expected failures with `HTTPException`.
- b4 "Wrong toolbox": deactivate the venv and run the app →
  `ModuleNotFoundError: No module named 'fastapi'`. why: packages live in
  the venv. fix: `source .venv/bin/activate`; check with `which python`.

**Traps**
- `422 Unprocessable Entity` → the body does not match the model → read `detail`: it names the field
- `404 Not Found` on a route you wrote → wrong path, missing router prefix, or the old server is still running → open `/docs` and look at the real paths
- `405 Method Not Allowed` → right path, wrong method (GET vs POST) → check the method in `/docs`
- `500 Internal Server Error` → an exception in your code → read the server log, bottom line of the traceback first
- `ModuleNotFoundError` → venv not active or package not installed → `which python`, `pip list`
- `RuntimeWarning: coroutine '…' was never awaited` → you forgot `await` → add it
- Browser says "blocked by CORS policy" but curl works → the browser needs permission headers → add `CORSMiddleware` with the front-end's origin

**Deliverable** repo `quest-api` with the structure above, `README.md`
(how to run, how to test, example curl calls), tests passing; sketch: the
path of one `/ask` request through your files (router → schema → service →
response); demo: run it, call it, break it with bad input, show the log
line, run the tests.

**selfCheck** I can add an endpoint with validated input without looking
at a tutorial. / I choose status codes on purpose. / I know when `async`
helps and when it hurts. / No secret has ever been in my git history. /
Someone else can run my service from the README alone.

**Quiz**
1. Client gets 422 on POST /ask → body does not match the Pydantic model ✔ / server crashed / wrong port. why: 422 = "I understood the request but the data is not valid".
2. `/health` hangs while another request runs `time.sleep(10)` in an `async def` → a blocking call froze the event loop ✔ / too few CPU cores / network problem.
3. Where should the database password live? → in an environment variable loaded from an untracked `.env` ✔ / in `config.py` / in the README.
4. curl works, browser front-end fails with a CORS error → add CORS middleware allowing the front-end origin ✔ / open a firewall port / switch to GET.
5. You get 500 and the response says only "Internal Server Error". Where is the real reason? → in the server's log, at the bottom of the traceback ✔ / in the browser console / nowhere.

**Links** FastAPI tutorial — https://fastapi.tiangolo.com/tutorial/ ·
Pydantic docs — https://docs.pydantic.dev/latest/ · HTTP status codes
(MDN) — https://developer.mozilla.org/en-US/docs/Web/HTTP/Status · pytest
getting started — https://docs.pytest.org/en/stable/getting-started.html ·
The Twelve-Factor App (config chapter) — https://12factor.net/config

**Cheatsheet** `python3 -m venv .venv`, `source .venv/bin/activate`,
`pip install "fastapi[standard]"`, `pip freeze > requirements.txt`,
`fastapi dev app/main.py`, `uvicorn app.main:app --host 0.0.0.0 --port 8000`,
`curl -s localhost:8000/health`,
`curl -s -X POST localhost:8000/ask -H "Content-Type: application/json" -d '{"question":"hi there"}'`,
`pytest -q`, `pytest -k name -x`.

**kindNote** idea: the learner turned Python into a service with a menu, manners
and a paper trail. From now on their work is something other people can
build on — that is the real meaning of "backend".

---

## Level 4 — Docker & Compose

- slug `docker`, weeks 1, landmark `harbour`, badge "Container Tamer" 📦
- tagline: "Pack your app with everything it needs, so it runs the same everywhere."
- skill "Containers" — junior: "I run `docker compose up` and hope."
  growing: "I write a Dockerfile and read container logs." middle: "I
  design a compose stack, keep data safe in volumes, and debug a
  container that will not start."
- itsNormal: Docker adds a second, invisible computer inside your
  computer. Being confused about "which localhost is this?" is the
  standard experience, not a personal failing.
- analogy 🍱 "A container is a lunchbox": the **image** is the recipe plus
  the packed box in the freezer; a **container** is one box taken out and
  opened. The box has its own little world inside — its own files, its own
  `localhost`. A **volume** is a shelf in the real kitchen that the box
  may use, so food survives after the box is thrown away. `-p 8080:8000`
  cuts a door in the box.

**Body sections**
1. Why: "works on my machine" → ship the machine. Image vs container. Diagram `image-vs-container`.
2. A Dockerfile, line by line (use the six lines from the widget spec).
   Each line is a layer; layers are cached. Then the widget:
   `<DockerfileStacker client:visible />`.
3. Build and run: `docker build -t quest-api .`,
   `docker run --rm -p 8000:8000 quest-api`, `docker ps`, `docker logs -f`,
   `docker exec -it <name> sh` ("open the box and look inside").
4. Ports again: left is the machine, right is the box. The app inside
   must listen on `0.0.0.0`. Then `<PortPlayground client:visible />`
   with the sentence "Switch it to Docker mode."
5. Data: containers are disposable. Anything worth keeping goes in a
   volume. Diagram `volume`.
6. `.dockerignore` and small images: `-slim` base, no `.venv`, no `.git`.
7. Compose: several boxes that know each other **by service name**.
   ```yaml
   services:
     api:
       build: .
       ports: ["8000:8000"]
       env_file: .env
       depends_on:
         db:
           condition: service_healthy
     db:
       image: postgres:17
       environment:
         POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
       volumes: ["pgdata:/var/lib/postgresql/data"]
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U postgres"]
         interval: 5s
         retries: 10
   volumes:
     pgdata:
   ```
   Inside compose the API reaches the database at `db:5432`, never
   `localhost:5432`. Diagram `compose-network`.
8. Everyday commands: `docker compose up -d --build`, `logs -f api`,
   `ps`, `exec api sh`, `down`. Warning box: `down -v` also deletes volumes.
9. A real example: "This website runs in Docker. Open its `Dockerfile`
   and `compose.yaml` in the repo and read them — you now can."

**Missions**
- m1 "Pack the lunchbox": Dockerfile for `quest-api`, `.dockerignore`
  (`.venv`, `.git`, `__pycache__`, `.env`), build, run, curl `/health`.
  check: works with the venv deactivated.
- m2 "Look inside": open a shell in the running container with
  `docker exec -it <name> sh`; find the app files with `ls`; run
  `hostname` and `env | sort`; run the same two commands on the host and
  compare. check: the learner can say three things
  that differ inside the box (hostname, files, environment).
- m3 "Fast rebuilds": time a rebuild after changing one line of code,
  with the bad order and the good order (`time docker build …`).
  check: the good order rebuilds in seconds; the learner can say why.
- m4 "Two boxes": compose with `api` and `db` as above; an endpoint
  `/ready` that opens a connection to the database and returns 200 or 503.
  check: `docker compose ps` shows both healthy; `/ready` is 200; stop the
  db and it turns 503.
- m5 "Data that survives": create a table and a row with
  `docker compose exec db psql -U postgres`, run `docker compose down`
  then `up -d` — the row is still there. Then (carefully, on this toy
  project only) `down -v` and see it gone. check: the learner can explain where
  the data lived.

**Breaks**
- b1 "Family only, in a box": run uvicorn inside the container with
  `--host 127.0.0.1` → `curl: (56) Recv failure: Connection reset by peer`.
  why: inside the box 127.0.0.1 is the box itself. fix: `--host 0.0.0.0`.
- b2 "The box that closes at once": make CMD point to a missing module →
  `docker ps` shows nothing; `docker ps -a` shows `Exited (1)`.
  fix: `docker logs <name>` — the reason is always in there.
- b3 "Which localhost?": set the API's database host to `localhost` in
  compose → `connection refused` on 5432. why: `localhost` is the API's
  own box. fix: use the service name `db`.
- b4 "Door already taken": run the container twice with `-p 8000:8000` →
  `Bind for 0.0.0.0:8000 failed: port is already allocated`.
  fix: `docker ps`, stop the other one, or publish another host port.

**Traps**
- `port is already allocated` → another container or app holds the host port → `docker ps`; `ss -tlnp | grep :<port>`
- Container status `Exited (1)` → the main process crashed → `docker logs <name>`
- `Exited (137)` → killed, usually out of memory → `docker stats`; give it more memory or use less
- `COPY failed: file not found` → file outside the build context or excluded by `.dockerignore` → check both
- `Cannot connect to the Docker daemon` → Docker is not running, or no permission → `sudo systemctl status docker`; are you in the `docker` group?
- `exec format error` → image built for another CPU type → build with `--platform linux/amd64`
- "My change is not in the container" → you did not rebuild → `docker compose up -d --build`

**Deliverable** `quest-api` now has `Dockerfile`, `.dockerignore`,
`compose.yaml`, README updated ("one command to run"); sketch: your
machine, the two boxes, the compose network, the volume, every port on
every arrow; demo: clone the repo to a fresh folder, `docker compose up -d`,
everything works; then show one break and its fix.

**selfCheck** I can explain image vs container without the word
"virtual". / I know which `localhost` I mean, every time. / When a
container dies, I read its logs before anything else. / My data is in a
named volume. / I can read someone else's compose file and draw it.

**Quiz**
1. App in container, `-p 8000:8000`, curl gives "Connection reset by peer" → app listens on 127.0.0.1 inside the container ✔ / firewall / wrong image name.
2. API container cannot reach Postgres at `localhost:5432` in compose → use the service name `db` ✔ / publish port 5432 / restart Docker.
3. `docker ps` shows nothing right after `docker run -d` → the container exited; `docker ps -a` and `docker logs` ✔ / Docker is slow / wrong port.
4. Every code change reinstalls all packages on build → `COPY . .` is above `pip install`; copy requirements first ✔ / no internet / too little RAM.
5. After `docker compose down -v` the database is empty → `-v` deleted the volume ✔ / Postgres bug / wrong password.

**Links** Docker "Get started" — https://docs.docker.com/get-started/ ·
Dockerfile reference — https://docs.docker.com/reference/dockerfile/ ·
Compose file reference — https://docs.docker.com/reference/compose-file/ ·
Docker roadmap (visual) — https://roadmap.sh/docker

**Cheatsheet** `docker build -t name .`, `docker run --rm -p H:C name`,
`docker ps -a`, `docker logs -f name`, `docker exec -it name sh`,
`docker compose up -d --build`, `docker compose logs -f svc`,
`docker compose ps`, `docker compose down`, `docker stats`,
`docker system df`, `docker image prune`.

**kindNote** idea: "works on my machine" is no longer the learner's sentence.
They can hand anyone a box that runs the same everywhere — and they know which
localhost is which, which many people never fully learn.

---

## Level 5 — Data layer

- slug `data`, weeks 1, landmark `library`, badge "Keeper of Rows" 📚
- tagline: "Give your service a memory: Postgres, vectors and a cache."
- skill "Data" — junior: "I read CSV files and call someone else's
  database." growing: "I write SQL, migrations, and store embeddings."
  middle: "I design tables for a feature, keep them migrated and backed
  up, and know why a query is slow."
- itsNormal: SQL reads like English and then refuses to behave like
  English. Everyone writes a JOIN wrong the first ten times.
- analogy 🏛️ "Three kinds of memory": **Postgres** is a library with a
  strict librarian — everything has a shelf and a rule. **pgvector** adds
  shelves arranged by *meaning*, so similar ideas stand next to each
  other. **Redis** is sticky notes on your monitor — instant, small, and
  allowed to fall off.

**Body sections**
1. Tables, rows, keys. `psql` basics: `\l`, `\dt`, `\d table`, `\q`.
2. SQL you need weekly: `SELECT … WHERE … ORDER BY … LIMIT`, `INSERT`,
   `UPDATE … WHERE` (warning: without `WHERE` it changes every row),
   `JOIN`, `COUNT/GROUP BY`. Diagram `join`.
3. Talking to Postgres from Python: SQLAlchemy 2 or psycopg 3; connection
   string from settings; a connection **pool**; always parameters, never
   string-built SQL (one-line SQL injection example).
4. Migrations: the schema is code. Alembic: `alembic init migrations`,
   `alembic revision --autogenerate -m "create documents"`,
   `alembic upgrade head`. Diagram `migrations-timeline`.
5. Indexes and `EXPLAIN ANALYZE`: `Seq Scan` = reading every book;
   `Index Scan` = using the catalogue.
6. Vectors: an embedding is a list of numbers that places a text on a map
   of meaning. Diagram `meaning-map` (2-D dots: "refund" near "money
   back", far from "opening hours").
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE TABLE chunks (
     id bigserial PRIMARY KEY,
     document_id bigint NOT NULL,
     content text NOT NULL,
     embedding vector(384)
   );
   SELECT id, content FROM chunks ORDER BY embedding <=> :query_vec LIMIT 5;
   CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
   ```
   `<=>` is cosine distance: smaller = closer. Use the image
   `pgvector/pgvector:pg17` in compose.
7. Redis as a cache: `SET key value EX 60`, `GET`, `TTL`; cache-aside
   pattern: look in the cache, else compute and store. Diagram `cache-aside`.
8. Backups: `pg_dump -Fc dbname > backup.dump`, `pg_restore`. "A backup
   you have never restored is a hope, not a backup."

No widget besides the quiz.

**Missions**
- m1 "Open the library": switch compose db image to
  `pgvector/pgvector:pg17`; connect with `psql`; create a `documents`
  table by hand; insert three rows; query them. check: `\dt` lists it.
- m2 "Schema as code": drop the hand-made table; add Alembic; create
  `documents(id, title, source, created_at)` and
  `chunks(id, document_id → documents, content, embedding vector(384))`
  through migrations. check: `alembic upgrade head` on an empty database
  creates everything.
- m3 "Shelves by meaning": script that embeds ~20 short sentences with
  `sentence-transformers` (`intfloat/multilingual-e5-small`; prefix
  stored texts with `passage: ` and queries with `query: ` — this model
  expects that) and inserts them; endpoint `GET /search?q=` returning the
  5 nearest. check: searching "money back" finds the refund sentence
  though the words differ.
- m4 "Sticky notes": add Redis to compose (`redis:7-alpine`); cache
  `/search` results for 60 s keyed by the query; log `cache hit` /
  `cache miss`. check: second identical call logs a hit and is faster.
- m5 "Fire drill": `pg_dump` the database, `docker compose down -v`,
  bring it up, restore, verify the rows. check: data is back; the steps
  are written in `BACKUP.md`.

**Breaks**
- b1 "Wrong key to the library": wrong password in `.env` →
  `FATAL: password authentication failed for user "postgres"`. fix: match
  the password the volume was first created with (changing the env var
  later does not change an existing database).
- b2 "Wrong shape": insert a 3-number vector →
  `ERROR: expected 384 dimensions, not 3`. why: the column fixes the
  size; changing embedding model means re-embedding everything.
- b3 "Read every book": insert 200,000 rows with `generate_series`,
  run a `WHERE` query with `EXPLAIN ANALYZE` → `Seq Scan`, slow. fix:
  `CREATE INDEX`, run again → `Index Scan`, fast.
- b4 "Forgot the migration": add a column in the model but do not
  migrate → `column "…" does not exist`. fix: new revision, upgrade.

**Traps**
- `connection refused` on 5432 → wrong host (`localhost` inside a container) or db not ready → use the service name; add a healthcheck and `depends_on`
- `password authentication failed` → password differs from the one stored in the volume → check `.env`; on a toy db recreate the volume
- `relation "x" does not exist` → migration not applied, or connected to another database → `alembic current`; `\dt`
- `too many clients already` → connections opened and never returned → use one pool; close sessions
- `duplicate key value violates unique constraint` → inserting something that already exists → decide: skip, update (`ON CONFLICT`), or fix the input
- `could not translate host name "db"` → running outside the compose network → from the host use `localhost` and the published port

**Deliverable** `quest-api` with migrations, `/search`, cache,
`BACKUP.md`; sketch: tables and their links, plus where Redis sits in a
request; demo: empty database → migrate → load → search → show a cache
hit → restore from a backup.

**selfCheck** I can design two related tables and say why. / I never
change a schema by hand in a shared database. / I can read `EXPLAIN
ANALYZE` well enough to spot a missing index. / I know what my embedding
dimension is and what breaks if it changes. / I have restored a backup at
least once.

**Quiz**
1. `relation "chunks" does not exist` → migration not applied or wrong database ✔ / Postgres is down / wrong port.
2. Query is slow; `EXPLAIN` shows `Seq Scan` on 5 million rows → add an index on the filtered column ✔ / add RAM / restart.
3. You switched embedding model 384 → 1024 dims → change the column and re-embed all documents ✔ / nothing / only new documents need it. why: old and new vectors live on different maps.
4. Which data fits Redis? → an answer you can compute again, cached for a minute ✔ / the only copy of user documents / migrations.
5. Building SQL with f-strings from user input → SQL injection; use query parameters ✔ / slow / fine in Python.

**Links** PostgreSQL tutorial — https://www.postgresql.org/docs/current/tutorial.html ·
pgvector README — https://github.com/pgvector/pgvector ·
Alembic tutorial — https://alembic.sqlalchemy.org/en/latest/tutorial.html ·
Redis data types — https://redis.io/docs/latest/develop/data-types/ ·
Use The Index, Luke — https://use-the-index-luke.com/

**Cheatsheet** `docker compose exec db psql -U postgres`, `\l`, `\dt`,
`\d table`, `EXPLAIN ANALYZE <query>;`, `alembic revision --autogenerate -m "msg"`,
`alembic upgrade head`, `alembic current`, `alembic downgrade -1`,
`pg_dump -Fc db > f.dump`, `pg_restore -d db f.dump`,
`docker compose exec redis redis-cli`, `SET k v EX 60`, `TTL k`.

**kindNote** idea: the learner's service now remembers. They have also done the
thing many teams only talk about — restored a backup. That is the calm,
unglamorous kind of skill that makes people trust an engineer with data.

---

## Level 6 — LLM serving

- slug `llm`, weeks 1, landmark `lighthouse`, badge "Token Tactician" 🗼
- tagline: "Call a language model like an engineer, not like a chat user."
- skill "LLM integration" — junior: "I call the model and print the
  answer." growing: "I handle streaming, limits, timeouts and structured
  output." middle: "My LLM calls are observable, bounded, retried safely,
  and I can explain their latency."
- itsNormal: the model is the first component in your career that gives a
  different answer every time. Feeling uneasy about that is correct
  engineering instinct — this level turns it into habits.
- analogy 👩‍🍳 "A brilliant chef with a small table": the **context
  window** is the table — everything the chef can see at once: your
  instructions, the documents, and the dish being written. **Tokens** are
  bites (a word is one or a few). `max_tokens` is how big a dish may get.
  If the table is full, something falls off.

**Body sections**
1. The API shape (OpenAI-compatible, served by vLLM, Ollama and others):
   ```python
   from openai import OpenAI
   client = OpenAI(base_url=settings.llm_base_url, api_key=settings.llm_api_key)
   resp = client.chat.completions.create(
       model=settings.llm_model,
       messages=[
           {"role": "system", "content": "You answer in one short sentence."},
           {"role": "user", "content": "What is a port?"},
       ],
       temperature=0.2,
       max_tokens=200,
   )
   print(resp.choices[0].message.content, resp.usage)
   ```
   `GET /v1/models` lists the exact model names the server accepts.
2. Tokens and the context window: prompt tokens + output tokens must fit.
   Read `usage`. `finish_reason`: `stop` = finished; `length` = cut off
   by `max_tokens`. Diagram `context-window` (a bar: system | documents |
   question | answer, with a limit line).
3. Streaming: tokens arrive as they are made (server-sent events). Two
   numbers matter: time to first token and tokens per second. In FastAPI
   return a `StreamingResponse`. Diagram `streaming-timeline`.
4. Things fail: timeouts, 429, 5xx. Set `timeout=` and `max_retries=` on
   the client; retry with growing pauses; never retry forever.
5. Structured output: ask for JSON that matches a schema, validate with
   Pydantic, and decide what happens when it does not validate (retry
   once, then fail clearly). Temperature 0 for extraction.
6. Prompts are code: keep them in files, in git, with a version. Change
   one thing at a time.
7. Many requests at once: async client + a limit on parallel calls
   (`asyncio.Semaphore`). Connect back to Level 3's event loop.
8. Where the model lives: a model server such as vLLM loads the model
   onto a GPU once and serves many callers
   (`vllm serve <model> --port 8000`). `nvidia-smi` shows GPU memory.
   You will mostly be a caller; know what is on the other side of the port.

No widget besides the quiz.

**Missions**
- m1 "First call": add settings `llm_base_url`, `llm_api_key`,
  `llm_model`; list models with curl `…/v1/models`; make one call; print
  answer and `usage`. check: the learner can say how many tokens went in and out.
- m2 "Real answers": `/ask` now calls the model (no documents yet) with a
  system prompt from `prompts/answer_v1.txt`. Log model, prompt tokens,
  output tokens, duration. check: one log line per call with all four.
- m3 "Word by word": `POST /ask/stream` returning a `StreamingResponse`;
  test with `curl -N`. Measure time to first token and total time.
  check: text appears piece by piece; both numbers are logged.
- m4 "Shape the answer": endpoint `/extract` that turns a free-text café
  complaint into `Complaint(category: Literal[...], urgency: int 1–5,
  summary: str)` — JSON schema in the request, Pydantic validation, one
  retry on failure. Run it on 20 sample texts; count failures.
  check: a table of 20 results with a success rate.
- m5 "Be a good guest": client with `timeout=30`, `max_retries=2`; a
  script that sends 20 questions with at most 4 in parallel; report total
  time and the slowest call. check: no more than 4 calls overlap in the logs.

**Breaks**
- b1 "Who?": wrong model name → `404` "model … does not exist". fix: `GET /v1/models`.
- b2 "Table too small": paste a very long text as the question until →
  `400` with a message about maximum context length. fix: shorten or
  count tokens before sending.
- b3 "Half a sentence": `max_tokens=5` → answer stops mid-word,
  `finish_reason: "length"`. fix: raise it — and always check `finish_reason`.
- b4 "No patience": `timeout=0.5` → `APITimeoutError`. why: generation
  takes seconds. fix: sensible timeout, plus streaming so users see progress.

**Traps**
- `401 Unauthorized` → missing or wrong API key → check the env var is really loaded
- `404 model not found` → name differs from what the server serves → `GET /v1/models`
- `400 … maximum context length` → prompt + `max_tokens` exceed the window → trim input or lower `max_tokens`
- `429 Too Many Requests` → sending too fast → limit parallel calls, retry with pauses
- `Connection refused` / `503` → model server down or still loading → check its port and logs (Level 2!)
- Answer ends mid-sentence → `finish_reason` is `length` → raise `max_tokens`
- `JSONDecodeError` → model wrapped JSON in text or code fences → use the server's structured-output option and validate
- "Same question, different answer" → sampling → lower temperature; never rely on exact wording

**Deliverable** `quest-api` with `/ask`, `/ask/stream`, `/extract`,
prompts in files, token and latency logs; sketch: one streamed request on
a timeline (send → first token → last token) with your measured numbers;
demo: stream an answer live, show the log line, show an extraction
failure being caught.

**selfCheck** I can say what happens when the context window is full. /
I check `finish_reason`. / Every LLM call I write has a timeout and a
retry limit. / I never trust model JSON without validating it. / I can
give the latency of my endpoint in two numbers.

**Quiz**
1. Answer stops mid-sentence, `finish_reason: "length"` → `max_tokens` too low ✔ / model crashed / network cut.
2. `400` about context length → prompt plus requested output do not fit the window ✔ / wrong API key / server down.
3. Users complain the app "hangs" for 8 s then prints everything → add streaming ✔ / bigger GPU first / raise temperature.
4. Model returns "Sure! Here is the JSON: {…}" and your parser fails → use structured output and validate, retry once ✔ / add "please" / parse with regex forever.
5. 100 requests at once give many 429s → limit concurrency and retry with pauses ✔ / send them faster / ignore errors.

**Links** OpenAI API reference: chat — https://platform.openai.com/docs/api-reference/chat ·
vLLM docs — https://docs.vllm.ai/ · Ollama — https://ollama.com/ ·
Anthropic prompt engineering overview — https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

**Cheatsheet** `curl -s $LLM_BASE_URL/models`, a full curl chat call with
`-d '{"model":"…","messages":[…]}'`, `curl -N` (do not buffer — for
streams), `nvidia-smi`, `watch -n 1 nvidia-smi`, and a 6-row table of
parameters: `temperature`, `max_tokens`, `stream`, `timeout`,
`max_retries`, `finish_reason`.

**kindNote** idea: lots of people can chat with a model. The learner can now put
one inside a service that stays polite under pressure — bounded, timed,
validated. That is the difference between a demo and a product.

---

## Level 7 — Production RAG

- slug `rag`, weeks 3, landmark `book`, badge "Retrieval Ranger" 📖
- tagline: "Give the model an open book — and make sure it opens the right page."
- skill "RAG" — junior: "I followed a tutorial; it answers sometimes."
  growing: "I build ingest and retrieval and can see which chunks were
  used." middle: "I measure retrieval and answer quality, know which
  stage fails, and improve it with evidence."
- itsNormal: a first RAG works in an afternoon and then gives a confident
  wrong answer in front of someone important. That gap between "demo" and
  "trustworthy" is the whole job, and it is why this level has three weeks.
- analogy 📖 "An open-book exam": the model is a clever student who has
  not read your documents. Retrieval is the helper who runs to the shelf
  and brings pages. If the helper brings the wrong pages, the student
  still writes a fluent answer — from the wrong pages. Most "the model is
  hallucinating" problems are "the helper brought the wrong page".

**Structure of the three weeks** (show as three sub-headers in missions)
- Week 1 — make it work end to end (m1–m2).
- Week 2 — make it good (m3–m4).
- Week 3 — prove it is good (m5–m6).

**Body sections**
1. Two pipelines. **Ingest** (once per document): parse → clean → chunk →
   embed → store. **Query** (every question): embed question → retrieve →
   rerank → build prompt → generate → cite. Diagram `rag-two-pipelines`.
   Then `<RagPipeline client:visible />`.
2. Parsing is where quality is won or lost: PDFs lose tables, headers
   repeat on every page, scans need OCR. Always look at the parsed text
   with your own eyes. Keep metadata: source file, page, section title.
3. Chunking: a chunk should be one idea that makes sense alone. Start
   with a few hundred tokens and 10–20% overlap; prefer splitting on
   headings, paragraphs and sentences over blind character counts.
   `<ChunkingVisualiser client:visible />`.
4. Embeddings: same model for documents and questions; some models need
   prefixes (e5: `passage: ` / `query: `); a new model means re-embedding
   everything.
5. Hybrid retrieval: vector search finds *meaning* ("money back" ↔
   "refund"); keyword search finds *exact things* (order numbers, names,
   codes). Use both. Postgres full-text search for keywords:
   ```sql
   ALTER TABLE chunks ADD COLUMN tsv tsvector
     GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED;
   CREATE INDEX ON chunks USING gin (tsv);
   SELECT id, ts_rank(tsv, q) AS score
   FROM chunks, websearch_to_tsquery('simple', :question) q
   WHERE tsv @@ q ORDER BY score DESC LIMIT 20;
   ```
   Merge the two lists with reciprocal rank fusion: each chunk scores
   `1 / (60 + rank)` in each list; add the scores. Diagram `hybrid-fusion`.
6. Reranking: retrieve wide (20–30), then let a cross-encoder reranker
   read question and chunk together and keep the best 3–5.
7. The prompt: answer only from the numbered sources; cite like `[1]`;
   if the sources do not contain the answer, say so. Return the sources
   to the caller.
8. Evaluation — the part that separates guessing from engineering. Build a **golden
   set**: 30+ real questions, each with the chunk (or document and page)
   that holds the answer and a short reference answer. Measure:
   - retrieval: **hit rate@k** (is the right chunk in the top k?) and
     **MRR** (how high is it?);
   - answers: **faithfulness** (is every claim supported by the retrieved
     chunks?) and **correctness** (does it match the reference?), judged
     by an LLM with a fixed prompt, plus your own check of a sample.
   Run the evaluation after every change and keep a results table.
   Diagram `eval-loop`.
9. Triage rule: when an answer is wrong, look at the retrieved chunks
   first. Right chunk missing → retrieval problem (parsing, chunking,
   search). Right chunk present → generation problem (prompt, too much
   context, model).
10. Production extras, one paragraph each: re-ingesting changed
    documents (delete old chunks by document id), metadata filters and
    access rules (never retrieve what the user may not see), caching,
    a latency budget per stage.

**Missions**
- m1 "Fill the shelf" (week 1): write the Otter Café handbook as 6–8
  markdown/PDF files (or take any small public document set); ingest
  script `python -m app.ingest <folder>`: parse → chunk → embed → store
  with metadata. Print 5 random chunks and read them. check: `SELECT
  count(*) FROM chunks` > 0 and the printed chunks make sense alone.
- m2 "First open-book answer" (week 1): `/ask` = embed question → top 5 by
  vector → prompt with numbered sources → answer + `sources` list
  (document, page, chunk id). check: an answer cites `[n]` and the cited
  chunk really contains it.
- m3 "Two search engines" (week 2): add keyword search and fusion.
  Find three questions where vector-only fails and hybrid succeeds (hint:
  exact codes, names, numbers). check: a small before/after table.
- m4 "Second opinion" (week 2): add a reranker (retrieve 20 → keep 4);
  add the "I don't know" rule; ask 5 questions the handbook cannot
  answer. check: all 5 get an honest "not in the documents".
- m5 "The golden set" (week 3): `eval/golden.jsonl` with 30 questions
  (include 5 unanswerable); `python -m eval.run` prints hit rate@5, MRR,
  faithfulness, correctness; writes a row to `eval/results.md` with the
  date and what changed. check: one command prints four numbers.
- m6 "Improve with evidence" (week 3): make three changes, one at a time
  (for example chunk size, top-k, prompt wording), run the evaluation
  after each, keep or revert based on the numbers. check:
  `eval/results.md` has at least 4 rows and a sentence on each decision.

**Breaks**
- b1 "Two different maps": embed questions with a different model (or
  without the `query: ` prefix) → retrieved chunks are unrelated, hit
  rate collapses. fix: same model, right prefixes.
- b2 "Confetti chunks": chunk size 60 characters, no overlap → answers
  miss half the facts. why: no chunk holds a whole idea. fix: larger,
  structure-aware chunks.
- b3 "The confident student": remove the "say you don't know" rule and
  ask about something not in the handbook → a fluent invented answer.
  fix: restore the rule; keep unanswerable questions in the golden set.
- b4 "Too many pages": put 40 chunks in the prompt → slower, and answers
  get worse as the right chunk drowns. fix: rerank and keep few.

**Traps**
- "It sounds right but it is wrong" → almost always retrieval → print the retrieved chunks for that question
- The right document is never retrieved → parsing or chunking lost it → read the parsed text of that page
- Exact names, codes or numbers are not found → vector search blurs them → add keyword search
- Works in one language, weak in another → embedding model not multilingual, or wrong text-search config → use a multilingual model; check the tsvector language
- Same chunk appears twice in the prompt → document ingested twice → delete by document id before re-ingesting
- `expected 384 dimensions, not 1024` → embedding model changed → re-embed everything
- Slow answers → measure each stage; usually reranking too many chunks or a missing index
- "I changed the prompt and it feels better" → feelings are not a metric → run the golden set

**Deliverable** `quest-api` with ingest, hybrid retrieval, rerank,
citations, `eval/` with golden set and results history, README section
"How good is it?" with the current numbers; sketch: both pipelines with
your real settings (chunk size, k, models) and your numbers per stage;
demo: ask three questions live — one answered with a citation, one
honestly refused, one that used to fail and how you fixed it, with the
before/after numbers.

**selfCheck** When an answer is wrong I look at the retrieved chunks
before I touch the prompt. / I can say what my hit rate@5 is today. / I
change one thing at a time and measure. / My system says "I don't know"
when it should. / I can explain to a non-engineer why RAG can still be
wrong.

**Quiz**
1. Answer is fluent but wrong; the right chunk was not among the retrieved → fix retrieval (parsing, chunking, search) ✔ / use a bigger model / raise temperature.
2. Searching for order code "KZ-4471" finds nothing relevant with vector search → add keyword search and fuse ✔ / larger chunks / more GPUs.
3. Hit rate@5 is 0.95 but answers are often wrong → generation side: prompt, too much context, citations ✔ / chunking / embeddings.
4. You changed the embedding model → re-embed all documents ✔ / only new ones / nothing.
5. How do you know a prompt change helped? → run the golden set and compare numbers ✔ / it reads nicer / ask a colleague's opinion only.

**Links** pgvector README (hybrid search section) — https://github.com/pgvector/pgvector ·
PostgreSQL full-text search — https://www.postgresql.org/docs/current/textsearch.html ·
Sentence Transformers: retrieve & re-rank — https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html ·
Anthropic: Contextual Retrieval — https://www.anthropic.com/news/contextual-retrieval ·
Ragas docs (evaluation ideas) — https://docs.ragas.io/

**Cheatsheet** not commands this time but a one-page "RAG debugging
order": 1 read the parsed text → 2 read the chunks → 3 print retrieved
chunks for the failing question → 4 check hit rate → 5 only then touch
the prompt → 6 only then think about the model. Plus the two formulas
(hit rate@k, MRR, RRF) in words.

**kindNote** idea: the learner can now do what most RAG demos cannot — say how
good the system is, with numbers, and which part to fix next. That is
rare, and it is exactly the skill teams look for when they decide who to
trust with a real system.

---

## Level 8 — Ship it

- slug `ship`, weeks 1, landmark `rocket`, badge "Production Pal" 🚀
- tagline: "Cooking at home is not running a café. Time to open the doors."
- skill "Production" — junior: "I hand my code to someone who deploys
  it." growing: "I deploy with a script and can read logs when it
  breaks." middle: "I own a service in production: I deploy, watch, roll
  back, and write down how."
- itsNormal: production is scary because real people are on the other
  side. The fear does not go away; it turns into checklists. Every calm
  engineer you know is calm because of a checklist.
- analogy ☕ "Opening a café": at home you cook once, for yourself. A café
  needs opening hours (uptime), a way to know the oven is on (health
  checks), a diary of every order (logs), a count of how busy it is
  (metrics), a plan for when the milk runs out (runbook), and a way to
  bring back yesterday's menu fast (rollback).

**Body sections**
1. Same code, different places: all differences live in environment
   variables. Fail fast at startup if one is missing. Secrets never in
   git — and git never forgets (`git log -p`).
2. Health: `/health` = "the process is alive"; `/ready` = "I can do my
   job" (database and model reachable). Compose `healthcheck` and
   `restart: unless-stopped`. Diagram `health-vs-ready`.
3. Logs you can search: one JSON line per event, with a request id that
   follows the request through every step. `PYTHONUNBUFFERED=1` so logs
   appear at once.
4. Metrics, the four you need: request rate, error rate, latency (p50 and
   p95), and for LLM apps tokens per request. One line on Prometheus and
   `prometheus-fastapi-instrumentator` exposing `/metrics`. Diagram `p95`
   (why the average hides the slow 5%).
5. CI: on every push, run lint (`ruff check`), tests (`pytest`), and
   build the image. A red check means "do not deploy".
6. Deploy and rollback: build an image with a version tag (the git commit
   hash, not only `latest`), ship it, start it. Rollback = start the
   previous tag. Practise the rollback before you need it.
   Diagram `deploy-rollback`.
7. When it breaks: first make it work again (roll back, restart), then
   find out why. Write a short, blameless note: what happened, impact,
   cause, what we change.
8. The runbook: one page — how to deploy, how to roll back, where the
   logs are, what each alert means, who to call.
9. A real example: "This website is deployed exactly this way. Read
   `scripts/deploy.sh`, `.github/workflows/`, and `docs/SETUP-GITHUB-AWS.md`
   in its repo."

Widget: `<RequestJourney client:visible />` — "Where would it break?"
part, with the sentence "Each of these now has a log line and a health
check in your service."

**Missions**
- m1 "Fail fast, stay ready": required settings without defaults; app
  refuses to start with a clear message when one is missing; `/ready`
  checks database and model; compose healthcheck + restart policy.
  check: remove a variable → clear error at start; stop the db → `/ready` 503.
- m2 "A diary worth reading": JSON logs with request id, stage timings
  (retrieve, rerank, generate), token counts. Find one request's whole
  story with `docker compose logs api | grep <request-id>`.
  check: one grep shows the full path of one request.
- m3 "Count what matters": `/metrics`; a script that sends 50 requests;
  report p50, p95 and error rate. check: the learner can state the three numbers.
- m4 "The robot reviewer": GitHub Actions workflow — ruff, pytest, docker
  build — on every push. check: a green check on a good commit; a red
  one on a commit with a failing test.
- m5 "Launch and un-launch": `deploy.sh` that tags the image with the
  commit hash, ships it to a server the mentor provides (or a small cloud
  instance), starts it; `rollback.sh <tag>`. Deploy v1, deploy a
  deliberately broken v2, roll back. Write `RUNBOOK.md`.
  check: rollback takes under two minutes and is written down.

**Breaks**
- b1 "Pull the plug on the database": `docker compose stop db` → `/ready`
  503, clear log line; start it → heals without touching the API.
- b2 "The bad release": deploy an image that crashes at start → container
  restarts in a loop (`docker ps` shows "Restarting"). fix: rollback to
  the previous tag, then read the logs.
- b3 "Git never forgets": commit a file with a **fake** secret
  (`API_KEY=not-a-real-key`), delete it in the next commit, then
  `git log -p | grep not-a-real-key` — still there. why: history keeps
  everything. fix in real life: revoke the secret; deleting is not enough.
- b4 "Silent logs": run without `PYTHONUNBUFFERED=1` and use `print` →
  logs arrive late or in lumps. fix: set it; use `logging`.

**Traps**
- "Works locally, fails on the server" → the environments differ → compare env vars, image tag, data
- Container `Restarting` forever → crashes at startup → `docker logs`; roll back first
- `Exited (137)` → out of memory → `docker stats`; set limits, reduce load
- Disk full on the server → old images and logs → `docker system df`, `docker image prune`, log rotation
- "Which version is running?" → only `latest` was used → tag images with the commit hash; expose it at `/health`
- `502 Bad Gateway` after deploy → app not ready when nginx called it → wait for the healthcheck before switching
- No logs in `docker logs` → output buffered, or logging to a file inside the container → `PYTHONUNBUFFERED=1`, log to stdout

**Deliverable** `quest-api` with CI, deploy and rollback scripts,
`RUNBOOK.md`, metrics; sketch: the path from `git push` to a running
container, and the rollback path; demo: deploy live, show health, logs
for one request, the three numbers, then break it and roll back while
explaining what you are doing.

**selfCheck** I can deploy my service without help. / I have rolled back
for real. / I can find one request's full story in the logs. / I know my
p95 latency. / Someone else could run my service from the runbook.

**Quiz**
1. After deploy the container shows "Restarting (1)" → roll back to the previous tag, then read logs ✔ / wait an hour / delete the server.
2. Average latency is fine but some users wait 20 s → look at p95, not the average ✔ / users are wrong / add a cache blindly.
3. A secret was pushed to git and deleted in the next commit → revoke the secret; history still has it ✔ / all fine / rename the repo.
4. `/health` is 200 but every `/ask` fails → liveness is not readiness; `/ready` should check the database and model ✔ / health check is broken / restart twice.
5. Nobody knows which code is in production → tag images with the commit hash and show it in `/health` ✔ / always use `latest` / ask in chat.

**Links** The Twelve-Factor App — https://12factor.net/ ·
GitHub Actions quickstart — https://docs.github.com/en/actions/writing-workflows/quickstart ·
Google SRE Book: Monitoring Distributed Systems — https://sre.google/sre-book/monitoring-distributed-systems/ ·
Prometheus: getting started — https://prometheus.io/docs/prometheus/latest/getting_started/

**Cheatsheet** `docker compose ps`, `docker compose logs -f --tail 100 api`,
`docker compose logs api | grep <id>`, `docker stats`, `docker system df`,
`git rev-parse --short HEAD`, `docker build -t quest-api:$(git rev-parse --short HEAD) .`,
`docker save img | gzip | ssh host 'gunzip | docker load'`,
`curl -s host/ready`, `ruff check .`, `pytest -q`, plus a 5-line
"incident checklist": breathe → is it down for users? → roll back or
restart → confirm it works → then investigate and write it down.

**kindNote** idea: the learner opened the café. They have deployed, watched,
broken and rolled back a real service, and written down how. They do not
need someone to "take it to production" for them any more — they are that
someone.
