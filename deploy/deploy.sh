#!/usr/bin/env bash
# Build Momentum locally and upload the static files to the EC2 host.
# Run from the repo root:  bash deploy/deploy.sh
set -euo pipefail

HOST="${DEPLOY_HOST:-ubuntu@3.108.74.113}"
KEY="${DEPLOY_KEY:-$HOME/Downloads/openwa-key.pem}"
REMOTE_DIR="/var/www/momentum"

echo "==> Building"
npm run build

echo "==> Uploading dist/ to $HOST:$REMOTE_DIR"
ssh -i "$KEY" "$HOST" "sudo mkdir -p $REMOTE_DIR && sudo chown \$(id -un): $REMOTE_DIR"
rsync -az --delete -e "ssh -i $KEY" dist/ "$HOST:$REMOTE_DIR/"

echo "==> Done. Live at https://todo.flyziyara.com"
