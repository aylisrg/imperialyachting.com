#!/usr/bin/env bash
# VPS deploy for imperialyachting.com (docker compose, one image tag per release).
# Usage: deploy/vps-deploy.sh diagnose | deploy <ref> | rollback | videos-check [clip]
# Never prints env files or secrets.
set -euo pipefail

BASE="${IY_BASE:-/srv/imperialyachting}"
RELEASES="$BASE/releases"
SHARED="$BASE/shared"          # .env.production (+ optional .env) live here, not in git
CURRENT="$BASE/current"
REPO="${IY_REPO:-https://github.com/aylisrg/imperialyachting.com.git}"
PROJECT="${IY_PROJECT:-imperialyachting}"
IMAGE="${IY_IMAGE:-imperialyachting}"
HEALTH_URL="${IY_HEALTH_URL:-http://127.0.0.1:3000/}"
SITE_URL="${IY_SITE_URL:-https://imperialyachting.com}"
KEEP="${IY_KEEP:-5}"

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { log "ERROR: $*"; exit 1; }
redact() { grep -viE 'key|secret|password|passwd|token|auth' || true; }

compose() { # $1 = release dir, rest = compose args
  local dir="$1"; shift
  (cd "$dir" && docker compose -p "$PROJECT" -f docker-compose.yml -f release.override.yml "$@")
}

health() {
  for _ in $(seq 1 30); do
    if curl -fsS -o /dev/null --max-time 5 "$HEALTH_URL"; then return 0; fi
    sleep 2
  done
  return 1
}

nginx_reload() {
  if command -v nginx >/dev/null 2>&1; then
    sudo nginx -t 2>&1 | redact
    sudo nginx -t >/dev/null 2>&1 || die "nginx -t failed, not reloading"
    sudo systemctl reload nginx
  fi
}

activate() { # $1 = release dir
  local dir="$1"
  log "starting $(basename "$dir")"
  compose "$dir" up -d --no-build --remove-orphans web
  ln -sfn "$dir" "$CURRENT.tmp" && mv -Tf "$CURRENT.tmp" "$CURRENT"
}

cmd_diagnose() {
  log "read-only diagnose, nothing is changed"
  echo "== docker ps"; docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>&1 || true
  echo "== docker compose ls"; docker compose ls 2>&1 || true
  echo "== pm2 ls"; command -v pm2 >/dev/null && pm2 ls 2>&1 || echo "pm2 not installed"
  echo "== systemd units (node/next)"; systemctl list-units --type=service --all --no-pager 2>/dev/null | grep -iE 'node|next|imperial' || echo "none"
  echo "== nginx -T (sensitive lines stripped)"; sudo nginx -T 2>&1 | redact || true
  echo "== ls $BASE"; ls -la "$BASE" 2>&1 || true
  echo "== releases"; ls -1 "$RELEASES" 2>/dev/null || echo "none"
  echo "== current -> $(readlink "$CURRENT" 2>/dev/null || echo none)"
  local d
  for d in "$CURRENT" "$BASE" "$BASE/app" "$BASE/site"; do
    if [ -d "$d/.git" ]; then echo "== commit in $d"; git -C "$d" log -1 --format='%h %ci %s' 2>&1 || true; fi
  done
  echo "== videos"; find "$BASE/videos" -maxdepth 1 -type f 2>/dev/null | wc -l
}

cmd_deploy() {
  local ref="${1:-}"; [ -n "$ref" ] || die "usage: deploy <ref>"
  [ -f "$SHARED/.env.production" ] || die "missing $SHARED/.env.production"
  mkdir -p "$RELEASES"
  local tmp; tmp="$(mktemp -d "$RELEASES/.new-XXXX")"
  log "fetching $ref"
  git clone -q "$REPO" "$tmp"
  git -C "$tmp" checkout -q "$ref"
  local sha; sha="$(git -C "$tmp" rev-parse --short HEAD)"
  local name; name="$(date -u +%Y%m%dT%H%M%SZ)-$sha"
  local dir="$RELEASES/$name"
  mv "$tmp" "$dir"
  ln -sfn "$SHARED/.env.production" "$dir/.env.production"
  [ -f "$SHARED/.env" ] && ln -sfn "$SHARED/.env" "$dir/.env"
  printf 'services:\n  web:\n    image: %s:%s\n' "$IMAGE" "$name" > "$dir/release.override.yml"

  log "building image $IMAGE:$name"
  compose "$dir" build web >/dev/null || die "build failed, prod untouched"

  local prev; prev="$(readlink "$CURRENT" 2>/dev/null || true)"
  activate "$dir"
  nginx_reload
  if health; then
    log "OK: $name live ($HEALTH_URL)"
    # shellcheck disable=SC2012
    ls -1dt "$RELEASES"/*/ | tail -n +"$((KEEP + 1))" | xargs -r rm -rf
  else
    log "healthcheck failed"
    if [ -n "$prev" ] && [ -d "$prev" ]; then
      activate "$prev"
      if health; then log "rolled back to $(basename "$prev")"; else log "rollback also unhealthy"; fi
    fi
    exit 1
  fi
}

cmd_rollback() {
  local cur; cur="$(readlink -f "$CURRENT" 2>/dev/null || true)"
  local prev=""
  local d
  [ -n "$cur" ] || die "no current release"
  for d in "$RELEASES"/*/; do   # glob is sorted by name = by timestamp
    d="${d%/}"
    if [[ "$d" < "$cur" ]]; then prev="$d"; fi
  done
  [ -n "$prev" ] || die "no previous release"
  activate "$prev"
  if health; then log "OK: rolled back to $(basename "$prev")"; else die "previous release unhealthy"; fi
}

cmd_videos_check() {
  local clip="${1:-hero-vd40-speed-960.mp4}"
  local url="$SITE_URL/videos/$clip"
  log "Range check $url"
  local code; code="$(curl -s -o /dev/null -w '%{http_code}' -r 0-1023 "$url")"
  curl -sI -r 0-1023 "$url" | grep -iE '^(HTTP|content-type|content-range|accept-ranges|cache-control)' || true
  if [ "$code" = "206" ]; then log "OK 206"; else die "expected 206, got $code"; fi
}

case "${1:-}" in
  diagnose) cmd_diagnose ;;
  deploy) shift; cmd_deploy "$@" ;;
  rollback) cmd_rollback ;;
  videos-check) shift; cmd_videos_check "$@" ;;
  *) echo "usage: $0 diagnose | deploy <ref> | rollback | videos-check [clip]"; exit 2 ;;
esac
