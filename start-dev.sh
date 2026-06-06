#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PYTHON="$ROOT_DIR/.venv/bin/python"
FRONTEND_URL="http://127.0.0.1:5173"
BACKEND_URL="http://127.0.0.1:8000"

if [[ ! -x "$BACKEND_PYTHON" ]]; then
  echo "Missing repo venv at .venv. Create it first with python3 -m venv .venv" >&2
  exit 1
fi

if curl -fsS --max-time 2 http://127.0.0.1:8000/docs >/dev/null 2>&1; then
  echo "Backend already running on $BACKEND_URL"
else
  nohup "$BACKEND_PYTHON" -m uvicorn app:app --app-dir "$ROOT_DIR/backend" --host "${HOST:-127.0.0.1}" --port 8000 > "$ROOT_DIR/.backend-dev.log" 2>&1 &
  echo "Started backend on $BACKEND_URL"
fi

if curl -fsS --max-time 2 "$FRONTEND_URL" >/dev/null 2>&1; then
  echo "Frontend already running on $FRONTEND_URL"
else
  (cd "$ROOT_DIR/frontend" && nohup npm run dev -- --host "${HOST:-127.0.0.1}" > "$ROOT_DIR/.frontend-dev.log" 2>&1) &
  echo "Started frontend on $FRONTEND_URL"
fi

for _ in $(seq 1 30); do
  if curl -fsS --max-time 1 "$FRONTEND_URL" >/dev/null 2>&1; then
    echo "Frontend running on $FRONTEND_URL"
    break
  fi
  sleep 1
done

if ! curl -fsS --max-time 1 "$FRONTEND_URL" >/dev/null 2>&1; then
  echo "Frontend did not become ready. See $ROOT_DIR/.frontend-dev.log" >&2
  exit 1
fi