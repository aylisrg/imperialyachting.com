#!/usr/bin/env bash
# Copy data from Supabase Cloud into the self-hosted db + storage. Cloud is only read.
# Needs env (never echoed, never on a command line):
#   SUPABASE_CLOUD_DB_URL       postgres connection string of the cloud db (session pooler or direct)
#   SUPABASE_CLOUD_URL          https://<ref>.supabase.co      (storage copy)
#   SUPABASE_CLOUD_SERVICE_KEY  cloud service_role key         (storage copy)
# Usage: data-copy.sh db | storage | all   [--yes]  (db step TRUNCATEs public tables on the self-hosted side)
# Run migrate.sh (apply) first so the schema exists.
# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"
WHAT="${1:-}"; YES="${2:-}"
WORK="${IY_BASE}/backups/cloud-copy-$(date +%Y%m%d-%H%M%S)"
need() { [ -n "${!1:-}" ] || die "env $1 is not set"; }

copy_db() {
  need SUPABASE_CLOUD_DB_URL
  [ "$YES" = --yes ] || die "db copy truncates self-hosted public tables; rerun with --yes"
  mkdir -p "$WORK"; chmod 700 "$WORK"
  log "safety backup of self-hosted db first"; bash "$SB_DIR/backup.sh"
  log "dumping cloud data (public + auth.users/identities), url not shown"
  # Pass the URL as an env var name only; value never appears in argv or logs.
  # Do not combine --schema and --table: pg_dump ignores -n when -t is set,
  # so one command would dump only the auth tables and the TRUNCATE below
  # would wipe public data.
  docker exec -e SUPABASE_CLOUD_DB_URL supabase-db sh -c \
    'pg_dump "$SUPABASE_CLOUD_DB_URL" --data-only --no-owner --no-privileges --column-inserts --rows-per-insert=500 \
       --schema=public --exclude-table=public.schema_migrations \
     && pg_dump "$SUPABASE_CLOUD_DB_URL" --data-only --no-owner --no-privileges --column-inserts --rows-per-insert=500 \
       --table=auth.users --table=auth.identities' > "$WORK/cloud-data.sql"
  log "dump size: $(du -h "$WORK/cloud-data.sql" | cut -f1)"
  log "restoring into self-hosted (one transaction, triggers off)"
  {
    echo 'BEGIN;'
    echo "SET session_replication_role = replica;"
    echo "DO \$\$ DECLARE r record; BEGIN FOR r IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP EXECUTE format('TRUNCATE public.%I CASCADE', r.tablename); END LOOP; END \$\$;"
    echo "DELETE FROM auth.identities; DELETE FROM auth.users;"
    grep -vE '^(SET transaction_timeout|SELECT pg_catalog.set_config\(.search_path)' "$WORK/cloud-data.sql"
    echo "SET session_replication_role = origin;"
    echo 'COMMIT;'
  } | db_psql >/dev/null
  log "resetting sequences"
  db_psql <<'SQL' >/dev/null
DO $$ DECLARE r record; BEGIN
FOR r IN SELECT s.relname seq, t.relname tbl, a.attname col FROM pg_class s
  JOIN pg_depend d ON d.objid=s.oid JOIN pg_class t ON t.oid=d.refobjid
  JOIN pg_attribute a ON a.attrelid=t.oid AND a.attnum=d.refobjsubid
  JOIN pg_namespace n ON n.oid=s.relnamespace WHERE s.relkind='S' AND n.nspname='public' LOOP
  EXECUTE format('SELECT setval(%L, COALESCE((SELECT max(%I) FROM public.%I),0)+1, false)', 'public.'||r.seq, r.col, r.tbl);
END LOOP; END $$;
SQL
  log "row counts (self-hosted):"
  db_psql -c "select relname, n_live_tup from pg_stat_user_tables where schemaname='public' order by 1" || true
}

copy_storage() {
  need SUPABASE_CLOUD_DB_URL; need SUPABASE_CLOUD_URL; need SUPABASE_CLOUD_SERVICE_KEY
  command -v jq >/dev/null || die "jq not found (apt install jq)"
  local svc tmp list ok=0 bad=0 b name ct
  svc=$(sed -n 's/^SERVICE_ROLE_KEY=//p' "$SB_ENV")
  mkdir -p "$WORK"; chmod 700 "$WORK"; list="$WORK/objects.tsv"
  docker exec -e SUPABASE_CLOUD_DB_URL supabase-db sh -c \
    'psql "$SUPABASE_CLOUD_DB_URL" -XtA -F "\t" -c "select bucket_id, name, coalesce(metadata->>'"'"'mimetype'"'"','"'"'application/octet-stream'"'"') from storage.objects where name not like '"'"'%.emptyFolderPlaceholder'"'"' order by 1,2"' > "$list"
  log "objects in cloud: $(wc -l < "$list")"
  # make sure every cloud bucket exists locally with the same settings
  docker exec -e SUPABASE_CLOUD_DB_URL supabase-db sh -c \
    'psql "$SUPABASE_CLOUD_DB_URL" -XtA -c "select id, public from storage.buckets"' | while IFS='|' read -r b pub; do
      db_psql -c "insert into storage.buckets(id,name,public) values ('$b','$b',$pub) on conflict (id) do nothing" >/dev/null
    done
  tmp=$(mktemp)
  while IFS=$'\t' read -r b name ct; do
    enc=$(jq -rn --arg s "$name" '$s|@uri' | sed 's/%2F/\//g')
    if curl -sf -o "$tmp" -H "Authorization: Bearer $SUPABASE_CLOUD_SERVICE_KEY" -H "apikey: $SUPABASE_CLOUD_SERVICE_KEY" \
         "$SUPABASE_CLOUD_URL/storage/v1/object/authenticated/$b/$enc" &&
       curl -sf -o /dev/null -X POST -H "Authorization: Bearer $svc" -H "apikey: $svc" -H "x-upsert: true" \
         -H "Content-Type: $ct" --data-binary "@$tmp" "http://127.0.0.1:8000/storage/v1/object/$b/$enc"; then
      ok=$((ok + 1))
    else bad=$((bad + 1)); log "FAIL $b/$name"; fi
  done < "$list"
  rm -f "$tmp"
  log "storage copied: ok=$ok failed=$bad"; [ $bad = 0 ]
}

rewrite_urls_hint() {
  log "rows still pointing to the cloud domain (rewrite after preview check, see README):"
  db_psql -tA <<'SQL' || true
DO $$ DECLARE r record; c bigint; BEGIN
FOR r IN SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema='public' AND data_type IN ('text','character varying','jsonb','ARRAY') LOOP
  EXECUTE format('SELECT count(*) FROM public.%I WHERE %I::text LIKE %L', r.table_name, r.column_name, '%.supabase.co/%') INTO c;
  IF c > 0 THEN RAISE NOTICE '%.%: % rows', r.table_name, r.column_name, c; END IF;
END LOOP; END $$;
SQL
}

case "$WHAT" in
  db) copy_db; rewrite_urls_hint ;;
  storage) copy_storage ;;
  all) copy_db; copy_storage; rewrite_urls_hint ;;
  urls) rewrite_urls_hint ;;
  *) sed -n '2,9p' "$0"; exit 1 ;;
esac
