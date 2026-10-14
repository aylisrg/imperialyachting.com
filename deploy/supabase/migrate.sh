#!/usr/bin/env bash
# Apply supabase/migrations/*.sql to the self-hosted db in version order.
# Usage: migrate.sh [--dry-run] [--only <file>]
#   --dry-run: every pending file runs inside BEGIN..ROLLBACK, nothing is kept.
# Applied files are recorded in iy_meta.schema_migrations (skipped on rerun).
# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"
DRY=0; ONLY=""
while [ $# -gt 0 ]; do case "$1" in
  --dry-run) DRY=1 ;; --only) ONLY="$2"; shift ;; *) die "unknown arg $1" ;; esac; shift; done
MIG_DIR="${MIG_DIR:-$SB_DIR/../../supabase/migrations}"
[ -d "$MIG_DIR" ] || die "no $MIG_DIR"
docker exec supabase-db pg_isready -U postgres -q || die "supabase-db is not running"

db_psql <<'SQL'
create schema if not exists iy_meta;
revoke all on schema iy_meta from public, anon, authenticated;
create table if not exists iy_meta.schema_migrations (name text primary key, applied_at timestamptz default now());
SQL

# Order: standalone date-named files (YYYYMMDD_*.sql, no deps on numbered ones) first,
# then 001_.. in version order. 012 depends on 20260224_analytics_tables, so plain sort is wrong.
mapfile -t FILES < <(
  find "$MIG_DIR" -maxdepth 1 -regextype posix-extended -regex '.*/[0-9]{8}_[^/]*\.sql' -printf '%f\n' | sort
  find "$MIG_DIR" -maxdepth 1 -regextype posix-extended -name '*.sql' ! -regex '.*/[0-9]{8}_[^/]*\.sql' -printf '%f\n' | sort -V
)
applied() { [ "$(db_psql -tA -c "select 1 from iy_meta.schema_migrations where name='${1//\'/}'")" = 1 ]; }
PENDING=()
for f in "${FILES[@]}"; do
  [ -n "$ONLY" ] && [ "$f" != "$ONLY" ] && continue
  if applied "$f"; then log "skip $f (applied)"; else PENDING+=("$f"); fi
done
n=${#PENDING[@]}
[ "$n" = 0 ] && { log "nothing pending"; exit 0; }

if [ $DRY = 1 ]; then
  # All pending files in ONE transaction (later files depend on earlier ones), then ROLLBACK.
  log "dry-run: ${PENDING[*]}"
  {
    echo 'BEGIN;'
    for f in "${PENDING[@]}"; do printf '\\echo == %s\n' "$f"; cat "$MIG_DIR/$f"; echo; done
    echo 'ROLLBACK;'
  } | db_psql || die "dry-run FAILED, nothing kept"
  log "dry-run OK, nothing kept"
  exit 0
fi

bash "$SB_DIR/backup.sh"   # backup before apply
for f in "${PENDING[@]}"; do
  if { echo 'BEGIN;'; cat "$MIG_DIR/$f"; echo; echo "insert into iy_meta.schema_migrations(name) values ('${f//\'/}');"; echo 'COMMIT;'; } | db_psql >/dev/null; then
    log "applied     $f"
  else die "FAIL $f (rolled back, later files not run)"; fi
done
log "applied files: $n"
