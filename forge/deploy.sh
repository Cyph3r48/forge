#!/usr/bin/env bash
# Deploy the Forge to your host (:3400). Set FORGE_SSH to your ssh alias.
# Usage: bash deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."

SSH_HOST="${FORGE_SSH:?set FORGE_SSH to your ssh alias, e.g. myhost}"
REMOTE_DIR="${FORGE_DIR:-/opt/forge}"

echo "==> rsync source to $SSH_HOST:$REMOTE_DIR"
rsync -a --delete \
  --exclude node_modules --exclude .next --exclude .env --exclude .git \
  forge/ "$SSH_HOST:$REMOTE_DIR/"

echo "==> install + build on $SSH_HOST (node $(ssh $SSH_HOST node -v))"
ssh "$SSH_HOST" "cd $REMOTE_DIR && npm install --no-audit --no-fund >/dev/null 2>&1 && npx next build >/tmp/forge-build.log 2>&1 || { tail -20 /tmp/forge-build.log; exit 1; }"

echo "==> install/refresh systemd unit"
scp forge/forge.service "$SSH_HOST:/etc/systemd/system/forge.service" >/dev/null
ssh "$SSH_HOST" "systemctl daemon-reload && systemctl restart forge && systemctl is-active forge"

echo "==> verify"
ssh "$SSH_HOST" "set -a; . '$REMOTE_DIR/.env'; set +a; sleep 3; curl -s -o /dev/null -w 'UI: %{http_code}\n' http://localhost:3400/; curl -s -H \"Authorization: Bearer \$FORGE_AUTH_TOKEN\" http://localhost:3400/api/factory/status | head -c 300; echo"
