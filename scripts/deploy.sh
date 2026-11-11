#!/usr/bin/env bash
# Build the image here, send it to the server over SSH, start it there.
# Usage: ./scripts/deploy.sh <ssh-host>      e.g. ./scripts/deploy.sh quest
set -euo pipefail

HOST="${1:?usage: deploy.sh <ssh-host>}"
# Image tag: $QUEST_TAG if set, else the git tag on HEAD, else the commit.
TAG="${QUEST_TAG:-$(git describe --tags --exact-match 2>/dev/null || git rev-parse --short HEAD)}"
REMOTE_DIR="ai-quest"

cd "$(dirname "$0")/.."

echo "==> Building ai-quest:$TAG"
docker build --platform linux/amd64 -t "ai-quest:$TAG" -t ai-quest:latest .

echo "==> Sending files to $HOST"
ssh "$HOST" "mkdir -p $REMOTE_DIR"
scp -q compose.yaml Caddyfile "$HOST:$REMOTE_DIR/"
docker save "ai-quest:$TAG" | gzip | ssh "$HOST" 'gunzip | docker load'

echo "==> Starting"
ssh "$HOST" bash -s -- "$REMOTE_DIR" "$TAG" <<'REMOTE'
set -euo pipefail
cd "$1"
touch .env
# First deploy: serve on port 80. Later deploys keep whatever is set.
if ! grep -q '^QUEST_PORT=' .env; then echo 'QUEST_PORT=80' >> .env; fi
# Remember the previous tag, so a rollback is one command.
PREV="$(grep '^QUEST_TAG=' .env | cut -d= -f2 || true)"
sed -i '/^QUEST_TAG=/d' .env
echo "QUEST_TAG=$2" >> .env
docker compose up -d web
echo "Previous version: ${PREV:-none}"
REMOTE

echo "==> Done. Now running: $TAG"
echo "    Roll back with: ./scripts/rollback.sh $HOST <previous-tag>"
