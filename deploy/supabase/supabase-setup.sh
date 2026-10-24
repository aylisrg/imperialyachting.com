#!/usr/bin/env bash
# Self-hosted Supabase: secrets, start, app env switch.
# Usage:
#   supabase-setup.sh init           generate $SHARED/supabase.env + supabase-app.env (once, never overwrites)
#   supabase-setup.sh up             start db, kong, auth, rest, storage, meta
#   supabase-setup.sh status         container health + /rest/v1 and /storage/v1 probe via kong
#   supabase-setup.sh app-env preview|prod   point the app .env.production at self-hosted (backup kept)
#   supabase-setup.sh app-env-rollback preview|prod   restore the previous .env.production
# Never prints secret values.
# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"

APP_ENV_OUT="$SHARED/supabase-app.env"
PUBLIC_URL="${SB_PUBLIC_URL:-https://db.imperialyachting.com}"

b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }
rand() { openssl rand -hex "$1"; }
jwt() { # $1 role, $2 secret
  local h p s now exp
  now=$(date +%s); exp=$((now + 10 * 365 * 24 * 3600))
  h=$(printf '{"alg":"HS256","typ":"JWT"}' | b64url)
  p=$(printf '{"role":"%s","iss":"supabase","iat":%s,"exp":%s}' "$1" "$now" "$exp" | b64url)
  s=$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -hmac "$2" -binary | b64url)
  printf '%s.%s.%s' "$h" "$p" "$s"
}

cmd_init() {
  command -v openssl >/dev/null || die "openssl not found"
  sudo mkdir -p "$SHARED" "$SUPABASE_DATA/db" "$SUPABASE_DATA/storage" "$IY_BASE/backups"
  sudo chown "$(id -u):$(id -g)" "$SHARED" "$IY_BASE/backups"
  if [ -e "$SB_ENV" ]; then log "$SB_ENV already exists, not touching it"; return 0; fi
  umask 077
  local js anon svc
  js=$(rand 32); anon=$(jwt anon "$js"); svc=$(jwt service_role "$js")
  {
    echo "POSTGRES_PASSWORD=$(rand 24)"
    echo "JWT_SECRET=$js"
    echo "JWT_EXPIRY=3600"
    echo "ANON_KEY=$anon"
    echo "SERVICE_ROLE_KEY=$svc"
    echo "DASHBOARD_USERNAME=supabase"
    echo "DASHBOARD_PASSWORD=$(rand 16)"
    echo "PG_META_CRYPTO_KEY=$(rand 32)"
    echo "API_EXTERNAL_URL=$PUBLIC_URL"
    echo "SITE_URL=https://imperialyachting.com"
    echo "ADDITIONAL_REDIRECT_URLS=https://imperialyachting.com/**,https://new.imperialyachting.com/**"
    echo "DISABLE_SIGNUP=true"
    echo "SUPABASE_DATA=$SUPABASE_DATA"
    echo "# SMTP for magic links (fill in, then: supabase-setup.sh up)"
    echo "SMTP_ADMIN_EMAIL="; echo "SMTP_HOST="; echo "SMTP_PORT=587"; echo "SMTP_USER="; echo "SMTP_PASS="
  } > "$SB_ENV"
  {
    echo "NEXT_PUBLIC_SUPABASE_URL=$PUBLIC_URL"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon"
    echo "SUPABASE_SERVICE_ROLE_KEY=$svc"
  } > "$APP_ENV_OUT"
  chmod 600 "$SB_ENV" "$APP_ENV_OUT"
  log "written $SB_ENV and $APP_ENV_OUT (mode 600, values not shown)"
}

cmd_up() {
  [ -r "$SB_ENV" ] || die "run init first"
  sb_compose up -d db kong auth rest storage meta
  log "waiting for health"; sleep 15; cmd_status
}

cmd_status() {
  sb_compose ps --format 'table {{.Name}}\t{{.Status}}'
  local anon code
  anon=$(sed -n 's/^ANON_KEY=//p' "$SB_ENV")
  for p in /rest/v1/ /storage/v1/bucket /auth/v1/health; do
    code=$(curl -s -o /dev/null -w '%{http_code}' -H "apikey: $anon" -H "Authorization: Bearer $anon" "http://127.0.0.1:8000$p" || true)
    log "kong $p -> $code"
  done
}

app_env_file() { case "$1" in
  prod) echo "$IY_BASE/shared/.env.production" ;;
  preview) echo "/srv/imperialyachting-preview/shared/.env.production" ;;
  *) die "use preview or prod" ;; esac; }

cmd_app_env() {
  local f real tmp
  f=$(app_env_file "${1:-}"); [ -r "$APP_ENV_OUT" ] || die "run init first"
  [ -e "$f" ] || die "$f not found"
  real=$(readlink -f "$f")
  if [ "$1" = preview ] && [ "$real" = "$(readlink -f "$IY_BASE/shared/.env.production")" ]; then
    log "preview .env.production is a symlink to prod; replacing link with a private copy"
    cp --remove-destination "$real" "$f"; real="$f"
  fi
  cp -p "$real" "$real.cloud.bak.$(date +%Y%m%d%H%M%S)"
  tmp=$(mktemp); umask 077
  grep -vE '^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_SERVICE_ROLE_KEY)=' "$real" > "$tmp" || true
  cat "$APP_ENV_OUT" >> "$tmp"; cat "$tmp" > "$real"; rm -f "$tmp"
  log "$1: Supabase vars now point to self-hosted. Redeploy: bash deploy/vps-deploy.sh $([ "$1" = preview ] && echo --preview) deploy <ref>"
}

cmd_app_env_rollback() {
  local f real last
  f=$(app_env_file "${1:-}"); real=$(readlink -f "$f")
  last=$(find "$(dirname "$real")" -maxdepth 1 -name "$(basename "$real").cloud.bak.*" | sort | tail -1)
  [ -n "$last" ] || die "no backup found for $real"
  cp -p "$last" "$real"; log "$1: restored $last. Redeploy to apply."
}

case "${1:-}" in
  init) cmd_init ;; up) cmd_up ;; status) cmd_status ;;
  app-env) cmd_app_env "${2:-}" ;; app-env-rollback) cmd_app_env_rollback "${2:-}" ;;
  *) sed -n '2,10p' "$0"; exit 1 ;;
esac
