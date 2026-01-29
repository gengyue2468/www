#!/usr/bin/env bash
set -u

MAX_RETRY=10
RETRY=0

retry_git_pull() {
  until git pull www master; do
    RETRY=$((RETRY+1))
    if [ "$RETRY" -ge "$MAX_RETRY" ]; then
      echo "git pull failed after $MAX_RETRY attempts."
      return 1
    fi
    echo "failed to git pull, retrying in 5 seconds... (attempt: $RETRY)"
    sleep 5
  done
}

echo "Starting deployment..."

retry_git_pull || exit 1

npm run build || {
  echo "npm run build failed"
  exit 1
}

echo "Deployment completed"