#!/usr/bin/env bash
# Apply supabase/schema.sql, then supabase/migrations/*.sql, in version order.
# Usage: migrate.sh [--dry-run] [--only <file>]
#   --dry-run: every pending file runs inside BEGIN..ROLLBACK, nothing is kept.
# Applied files are recorded in iy_meta.schema_migrations (skipped on rerun).
#
# schema.sql is the base snapshot through migration 001 (yachts, pricing with
# hourly columns, destinations, handle_updated_at, photo buckets). 001 itself
# is not idempotent (CREATE TRIGGER / CREATE POLICY), so it is recorded as
# applied together with schema.sql and never run as its own file.
# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"
DRY=0; ONLY=""
while [ $# -gt 0 ]; do case "$1" in
  --dry-run) DRY=1 ;; --only) ONLY="$2"; shift ;; *) die "unknown arg $1" ;; esac; shift; done
MIG_DIR="${MIG_DIR:-$SB_DIR/../../supabase/migrations}"
SCHEMA="${SCHEMA:-$SB_DIR/../../supabase/schema.sql}"
BASE_001="001_add_hourly_pricing_and_destinations.sql"
[ -d "$MIG_DIR" ] || die "no $MIG_DIR"
[ -f "$SCHEMA" ] || die "no $SCHEMA"
docker exec supabase-db pg_isready -U postgres -q || die "supabase-db is not running"

db_psql <<'SQL'
create schema if not exists iy_meta;
revoke all on schema iy_meta from public, anon, authenticated;
create table if not exists iy_meta.schema_migrations (name text primary key, applied_at timestamptz default now());
SQL

applied() { [ "$(db_psql -tA -c "select 1 from iy_meta.schema_migrations where name='${1//\'/}'")" = 1 ]; }
sql_file() { if [ "$1" = schema.sql ]; then printf '%s' "$SCHEMA"; else printf '%s' "$MIG_DIR/$1"; fi; }

# A numbered migration (002_, 013_, ...) needs the base tables. Date-named
# files (YYYYMMDD_) do not. 001 is replaced by schema.sql.
needs_base() { case "$1" in ""|schema.sql|[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]_*) return 1 ;; *) return 0 ;; esac; }

if [ -n "$ONLY" ] && ! applied "schema.sql" && needs_base "$ONLY"; then
  [ "$ONLY" = "$BASE_001" ] || die "schema.sql is not applied yet; run migrate.sh without --only first"
fi

# Order: schema.sql, then date-named files (012 depends on 20260224), then 002..
PENDING=()
if ! applied "schema.sql"; then
  if [ -z "$ONLY" ] || [ "$ONLY" = schema.sql ] || [ "$ONLY" = "$BASE_001" ]; then
    PENDING+=(schema.sql)
  fi
fi
mapfile -t FILES < <(
  find "$MIG_DIR" -maxdepth 1 -regextype posix-extended -regex '.*/[0-9]{8}_[^/]*\.sql' -printf '%f\n' | sort
  find "$MIG_DIR" -maxdepth 1 -regextype posix-extended -name '*.sql' ! -regex '.*/[0-9]{8}_[^/]*\.sql' -printf '%f\n' | sort -V
)
for f in "${FILES[@]}"; do
  [ -n "$ONLY" ] && [ "$f" != "$ONLY" ] && continue
  if [ "$f" = "$BASE_001" ]; then
    if applied "schema.sql" || printf '%s\n' "${PENDING[@]}" | grep -qx 'schema.sql'; then
      applied "$f" || log "skip $f (included in schema.sql)"
      if applied "schema.sql" && ! applied "$f" && [ "$DRY" = 0 ] && [ -z "$ONLY" -o "$ONLY" = "$BASE_001" ]; then
        db_psql -c "insert into iy_meta.schema_migrations(name) values ('${f//\'/}') on conflict do nothing" >/dev/null
        log "marked $f applied (covered by schema.sql)"
      fi
      continue
    fi
  fi
  if applied "$f"; then log "skip $f (applied)"; else PENDING+=("$f"); fi
done
n=${#PENDING[@]}
[ "$n" = 0 ] && { log "nothing pending"; exit 0; }

if [ "$DRY" = 1 ]; then
  # All pending files in ONE transaction (later files depend on earlier ones), then ROLLBACK.
  log "dry-run: ${PENDING[*]}"
  {
    echo 'BEGIN;'
    for f in "${PENDING[@]}"; do printf '\\echo == %s\n' "$f"; cat "$(sql_file "$f")"; echo; done
    echo 'ROLLBACK;'
  } | db_psql || die "dry-run FAILED, nothing kept"
  log "dry-run OK, nothing kept"
  exit 0
fi

bash "$SB_DIR/backup.sh"   # backup before apply
for f in "${PENDING[@]}"; do
  {
    echo 'BEGIN;'
    cat "$(sql_file "$f")"
    echo
    echo "insert into iy_meta.schema_migrations(name) values ('${f//\'/}');"
    # 001's objects are created by schema.sql; do not run 001 afterwards.
    if [ "$f" = schema.sql ]; then
      echo "insert into iy_meta.schema_migrations(name) values ('${BASE_001//\'/}');"
    fi
    echo 'COMMIT;'
  } | db_psql >/dev/null && log "applied     $f" || die "FAIL $f (rolled back, later files not run)"
done
log "applied files: $n"
