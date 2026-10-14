# shellcheck shell=bash
# Shared helpers for deploy/supabase/*.sh. Never prints secrets.
set -euo pipefail
IY_BASE="${IY_BASE:-/srv/imperialyachting}"
SHARED="$IY_BASE/shared"
SB_ENV="${SB_ENV:-$SHARED/supabase.env}"
SB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SUPABASE_DATA="${SUPABASE_DATA:-$IY_BASE/supabase-data}"
log() { printf '[supabase] [%s] %s\n' "$(date +%H:%M:%S)" "$*" >&2; }
die() { log "ERROR: $*"; exit 1; }
sb_compose() { docker compose -p supabase --env-file "$SB_ENV" -f "$SB_DIR/docker-compose.yml" "$@"; }
# psql inside the db container as postgres; stdin is passed through.
db_psql() { docker exec -i supabase-db psql -v ON_ERROR_STOP=1 -X -q -U postgres -d postgres "$@"; }
