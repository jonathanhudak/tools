#!/usr/bin/env bash
# Launch the local DiffsHub viewer, optionally auto-loading a GitHub diff URL.
#
# Usage:
#   launch.sh                                  # just start/ensure the dev server
#   launch.sh https://github.com/o/r/pull/12   # start + open that PR's diff
#   launch.sh --split https://github.com/...    # open in split view
#
# Idempotent: if the dev server is already running on PORT it is reused.
set -euo pipefail

PORT=3010
BASE_PATH="/tools/diffshub/"

VIEW=""
URL=""
for arg in "$@"; do
  case "$arg" in
    --split) VIEW="split" ;;
    --unified) VIEW="unified" ;;
    *) URL="$arg" ;;
  esac
done

# Repo root = three levels up from this script (.claude/skills/diffshub/scripts).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
cd "$REPO_ROOT"

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)…" >&2
  pnpm install
fi

server_up() { curl -sS -o /dev/null --max-time 2 "http://localhost:${PORT}${BASE_PATH}" 2>/dev/null; }

if server_up; then
  echo "DiffsHub dev server already running on port ${PORT}." >&2
else
  echo "Starting DiffsHub dev server on port ${PORT}…" >&2
  pnpm --filter @hudak/diffshub dev >/tmp/diffshub-dev.log 2>&1 &
  for _ in $(seq 1 30); do
    if server_up; then break; fi
    sleep 0.5
  done
  if ! server_up; then
    echo "Dev server failed to start. See /tmp/diffshub-dev.log" >&2
    exit 1
  fi
fi

# Build the target URL.
target="http://localhost:${PORT}${BASE_PATH}"
query=""
if [ -n "$URL" ]; then
  enc=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$URL")
  query="diff=${enc}"
fi
if [ -n "$VIEW" ]; then
  [ -n "$query" ] && query="${query}&"
  query="${query}view=${VIEW}"
fi
[ -n "$query" ] && target="${target}?${query}"

echo "$target"

# Best-effort open in the default browser.
if command -v open >/dev/null 2>&1; then
  open "$target" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$target" >/dev/null 2>&1 || true
fi
