#!/usr/bin/env bash
# ============================================================================
# VectorShift Pipeline Builder — one-shot local launcher
# ----------------------------------------------------------------------------
# Starts the FastAPI backend on :8000 and the React dev server on :3000,
# both with hot-reload. Ctrl-C stops both.
#
# Requires: python.10+, pip, node 18+, npm.
# ============================================================================
set -eu
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN="\033[1;32m"
CYAN="\033[1;36m"
YELLOW="\033[1;33m"
RESET="\033[0m"

echo -e "${CYAN}▶ Setting up backend…${RESET}"
cd "$ROOT_DIR/backend"
python -m venv .venv 2>/dev/null || true
# shellcheck disable=SC1091
source .venv/Scripts/activate
pip install --quiet -r requirements.txt
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${YELLOW}  → created backend/.env from .env.example (edit it to enable Run).${RESET}"
fi
echo -e "${GREEN}✓ Backend dependencies ready${RESET}"

echo -e "${CYAN}▶ Setting up frontend…${RESET}"
cd "$ROOT_DIR/frontend"
if [ ! -d node_modules ]; then
  npm install --silent
fi
echo -e "${GREEN}✓ Frontend dependencies ready${RESET}"

echo -e "${CYAN}▶ Starting servers…${RESET}"

cleanup() { kill 0 2>/dev/null || true; }
trap cleanup INT TERM EXIT

(
  cd "$ROOT_DIR/backend"
  # shellcheck disable=SC1091
  source .venv/Scripts/activate
  uvicorn main:app --reload --port 8000
) &

(
  cd "$ROOT_DIR/frontend"
  BROWSER=none npm start
) &

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  Frontend : http://localhost:3000${RESET}"
echo -e "${GREEN}  Backend  : http://localhost:8000${RESET}"
echo -e "${GREEN}  Docs     : http://localhost:8000/docs${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
wait
