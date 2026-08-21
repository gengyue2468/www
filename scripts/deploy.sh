#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname -- "$SCRIPT_DIR")"
cd "$REPO_DIR"

exec 9>"$REPO_DIR/.deploy.lock"
flock -n 9 || { printf '%s\n' 'Another deployment is already running.' >&2; exit 1; }

git pull --ff-only
bun install --frozen-lockfile
bun run typecheck
bun run build

printf '%s\n' 'Deployed!'
