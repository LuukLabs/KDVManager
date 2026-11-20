#!/usr/bin/env bash
# Deploy/update the stack. Run ON THE VM as the deploy user from /opt/kdvmanager.
# To roll out new versions: change the *_TAG values in .env, then run this.
set -euo pipefail
cd /opt/kdvmanager
[ "$(stat -c %a .env)" = "600" ] || { echo ".env must be chmod 600" >&2; exit 1; }
docker compose config --quiet
docker compose pull --quiet
docker compose up -d --remove-orphans
docker image prune -f >/dev/null
docker compose ps
