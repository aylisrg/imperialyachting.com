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
HEALTH_URL="${IY_HEALTH_URL:-http://127.0.0.1:3000/api/health}"
SITE_URL="${IY_SITE_URL:-https://imperialyachting.com}"
KEEP="${IY_KEEP:-5}"

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
die() { log "ERROR: $*"; exit 1; }
redact() { grep -viE 'key|secret|password|passwd|token|auth' || true; }

compose() { # $1 = release dir, rest = compose args
  local dir="$1"; shift
  (cd "$dir" && docker compose -p "$PROJECT" -f docker-compose.yml -f release.override.yml "$@")
}

release_name() { basename "$1"; }

# Success only if (a) the compose container of THIS project runs the release
# image tag and (b) /api/health answers 200 with "commit":"<full git sha>"
# (image built with --build-arg GIT_SHA).
# A response from an old process on the port never matches the new SHA.
health() { # $1 = release dir
  local dir="$1" tag sha _ state body
  tag="$IMAGE:$(release_name "$dir")"
  sha="$(cat "$dir/.release-sha" 2>/dev/null || true)"
  [ -n "$sha" ] || { log "health FAIL: $dir/.release-sha missing"; return 1; }
  for _ in $(seq 1 30); do
    state="$(compose "$dir" ps --format '{{.Image}} {{.State}} {{.Health}}' web 2>/dev/null || true)"
    if printf '%s\n' "$state" | grep -qE "^${tag} running( healthy)?\s*$"; then
      body="$(curl -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null || true)"
      if [ -n "$body" ] && ! printf '%s' "$body" | grep -q '"commit"'; then
        log "health FAIL: /api/health has no \"commit\" field (build without GIT_SHA support)."
        log "Hint: this ref predates the /api/health commit PR. Deploy a ref that contains it."
        return 1
      fi
      if printf '%s' "$body" | grep -qE "\"commit\": ?\"${sha}\""; then
        log "health OK: container $tag running, /api/health commit=$sha"
        return 0
      fi
    fi
    sleep 2
  done
  log "health FAIL (old site responses do not count): container state='${state:-none}', expected $tag running and commit=$sha"
  return 1
}

# Anything that serves the site outside our compose project (first deploy case).
legacy_report() {
  local found=0 out
  out="$(docker ps --filter publish=3000 --format '{{.Names}} {{.Image}} project={{.Label "com.docker.compose.project"}}' 2>/dev/null | grep -v "project=${PROJECT}\$" || true)"
  [ -n "$out" ] && { echo "  docker on :3000: $out"; found=1; }
  if command -v pm2 >/dev/null 2>&1; then
    out="$(pm2 jlist 2>/dev/null | grep -oE '"name":"[^"]+"' | sort -u | tr '\n' ' ' || true)"
    [ -n "$out" ] && { echo "  pm2: $out"; found=1; }
  fi
  out="$(systemctl list-units --type=service --state=running --no-pager --plain 2>/dev/null | grep -iE 'node|next|imperial' | awk '{print $1}' | tr '\n' ' ' || true)"
  [ -n "$out" ] && { echo "  systemd: $out"; found=1; }
  out="$(sudo ss -ltnp 'sport = :3000' 2>/dev/null | tail -n +2 || true)"
  [ -n "$out" ] && { echo "  port 3000: $out"; found=1; }
  return $((1 - found))
}

first_deploy_help() {
  log "FIRST DEPLOY FAILED, no previous release to roll back to."
  log "Restore the old process found above (see deploy/README.md, section 'Первый деплой'):"
  log "  docker compose:  cd <old dir> && docker compose up -d"
  log "  pm2:             pm2 restart <name>   (or pm2 resurrect)"
  log "  systemd:         sudo systemctl start <unit>"
  log "Then stop the new one: cd $CURRENT && docker compose -p $PROJECT down"
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
  echo "== processes serving the site outside compose project '$PROJECT'"; legacy_report || echo "  none"
  echo "== videos"; find "$BASE/videos" -maxdepth 1 -type f 2>/dev/null | wc -l
}

cmd_deploy() {
  local ref="${1:-}"; [ -n "$ref" ] || die "usage: deploy <ref>"
  [ -f "$SHARED/.env.production" ] || die "missing $SHARED/.env.production"
  mkdir -p "$RELEASES"
  TMP_RELEASE="$(mktemp -d "$RELEASES/.new-XXXX")"
  trap 'rm -rf "${TMP_RELEASE:-}"' EXIT
  local tmp="$TMP_RELEASE"
  log "fetching $ref"
  git clone -q "$REPO" "$tmp"
  git -C "$tmp" checkout -q "$ref"
  local full_sha; full_sha="$(git -C "$tmp" rev-parse HEAD)"
  local sha="${full_sha:0:7}"
  echo "$full_sha" > "$tmp/.release-sha"
  local name; name="$(date -u +%Y%m%dT%H%M%SZ)-$sha"
  local dir="$RELEASES/$name"
  mv "$tmp" "$dir"
  TMP_RELEASE=""
  ln -sfn "$SHARED/.env.production" "$dir/.env.production"
  [ -f "$SHARED/.env" ] && ln -sfn "$SHARED/.env" "$dir/.env"
  printf 'services:\n  web:\n    image: %s:%s\n' "$IMAGE" "$name" > "$dir/release.override.yml"

  log "building image $IMAGE:$name"
  compose "$dir" build --build-arg GIT_SHA="$full_sha" web >/dev/null || { rm -rf "$dir"; die "build failed, prod untouched"; }

  local prev; prev="$(readlink "$CURRENT" 2>/dev/null || true)"
  if [ -z "$prev" ] || [ ! -d "$prev" ]; then
    prev=""
    log "FIRST DEPLOY: no previous release in $RELEASES, automatic rollback impossible."
    if legacy_report; then
      log "An old site process is running (listed above). If it holds port 3000 the new container cannot start."
      log "Stop it yourself first, or Ctrl+C now. Continuing in 10s."
      sleep 10
    fi
  fi
  activate "$dir"
  nginx_reload
  if health "$dir"; then
    log "OK: $name live"
    prune
  else
    if [ -n "$prev" ]; then
      activate "$prev"
      if health "$prev"; then log "rolled back to $(release_name "$prev")"; else log "rollback also unhealthy"; fi
    else
      first_deploy_help
    fi
    exit 1
  fi
}

prune() { # keep $KEEP newest releases, remove older dirs and their image tags
  local old=() d i n
  for d in "$RELEASES"/*/; do old+=("${d%/}"); done
  n=$(( ${#old[@]} - KEEP ))
  for (( i=0; i<n; i++ )); do
    d="${old[$i]}"
    [ "$d" = "$(readlink -f "$CURRENT")" ] && continue
    docker image rm "$IMAGE:$(release_name "$d")" >/dev/null 2>&1 || true
    rm -rf "$d"
    log "pruned $(release_name "$d")"
  done
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
  if health "$prev"; then log "OK: rolled back to $(basename "$prev")"; else die "previous release unhealthy"; fi
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
