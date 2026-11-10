#!/usr/bin/env bash
# Start an earlier image that is still on the server.
# Usage: ./scripts/rollback.sh <ssh-host> <tag>
#        ./scripts/rollback.sh <ssh-host>          (lists the tags on the server)
set -euo pipefail

HOST="${1:?usage: rollback.sh <ssh-host> [tag]}"
TAG="${2:-}"

if [ -z "$TAG" ]; then
  ssh "$HOST" "docker images ai-quest --format '{{.Tag}}  {{.CreatedSince}}'"
  exit 0
fi

ssh "$HOST" bash -s -- "$TAG" <<'REMOTE'
set -euo pipefail
cd ai-quest
docker image inspect "ai-quest:$1" > /dev/null
sed -i '/^QUEST_TAG=/d' .env
echo "QUEST_TAG=$1" >> .env
docker compose up -d web
REMOTE
echo "Now running: $TAG"
