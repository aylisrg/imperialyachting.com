#!/usr/bin/env bash
# Nightly dump of the self-hosted db to $IY_BASE/backups, keep $IY_BACKUP_KEEP_DAYS (default 14).
# Cron (root): 30 3 * * * /srv/imperialyachting/infra/deploy/supabase/backup.sh >> /srv/imperialyachting/backups/backup.log 2>&1
# shellcheck source=lib.sh
. "$(dirname "$0")/lib.sh"
DIR="$IY_BASE/backups"; KEEP="${IY_BACKUP_KEEP_DAYS:-14}"
mkdir -p "$DIR"; chmod 700 "$DIR"
out="$DIR/supabase-$(date +%Y%m%d-%H%M%S).dump"
docker exec supabase-db pg_dump -U postgres -d postgres -Fc --schema=public --schema=auth --schema=storage --schema=iy_meta > "$out.part"
mv "$out.part" "$out"; chmod 600 "$out"
log "backup $out ($(du -h "$out" | cut -f1))"
find "$DIR" -maxdepth 1 -name 'supabase-*.dump' -mtime +"$KEEP" -print -delete
# Storage files: rsync copy next to dumps (hardlink-style rotation not needed at this size)
if command -v rsync >/dev/null; then rsync -a --delete "$SUPABASE_DATA/storage/" "$DIR/storage-mirror/"; fi
