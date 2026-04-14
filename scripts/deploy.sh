#!/usr/bin/env bash
set -euo pipefail

REMOTE="${DEPLOY_REMOTE:-gengyue@100.101.102.10}"
REMOTE_DIR="${DEPLOY_REMOTE_DIR:-~/www}"

echo "[Deploy] Syncing files to ${REMOTE}:${REMOTE_DIR}/..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='public/*.txt' \
  ./ "${REMOTE}:${REMOTE_DIR}/"

echo "[Deploy] Building site on remote..."
ssh "${REMOTE}" "cd ${REMOTE_DIR} && npm run build"

echo "[Deploy] Deployment complete!"
echo "[Deploy] Note: IndexNow key file in public/ is preserved during sync."
echo "[Deploy] Visit https://www.indexnow.org/ to submit URLs or integrate with Bing Webmaster Tools."
