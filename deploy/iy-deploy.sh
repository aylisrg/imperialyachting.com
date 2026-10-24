#!/usr/bin/env bash
# Выкатка imperialyachting.com на наш сервер (Финский, 204.168.159.132), схема systemd.
# Docker-схема живёт отдельно: deploy/vps-deploy.sh. vercel.json не трогать, пока нет таймеров в репо.
#
#   bash deploy/iy-deploy.sh <экземпляр> deploy [ref]   собрать ref (по умолчанию origin/main) и переключить
#   bash deploy/iy-deploy.sh <экземпляр> rollback       вернуть предыдущий релиз
#   bash deploy/iy-deploy.sh <экземпляр> status         какой коммит сейчас отвечает
#
# Экземпляры: new (new.imperialyachting.com), live (imperialyachting.com).
# live выкатывается только после «да» Великого Шкипера: без IY_LIVE_OK=1 скрипт откажет.
set -euo pipefail

INST="${1:-}"; CMD="${2:-}"; REF="${3:-origin/main}"
REPO="https://github.com/aylisrg/imperialyachting.com"
KEEP="${IY_KEEP:-3}"

case "$INST" in
  new)  BASE=/opt/imperialyachting/new;  UNIT=iy-new;  PORT=3482; ENVF=/opt/imperialyachting/new.env ;;
  live) BASE=/opt/imperialyachting/boj; UNIT=iy-boj; PORT=3481; ENVF=/opt/imperialyachting/boj/site.env ;;
  *) echo "экземпляр: new или live"; exit 2 ;;
esac

if [ "$INST" = live ] && [ "$CMD" != status ] && [ "${IY_LIVE_OK:-}" != 1 ]; then
  echo "live — только после «да» Великого Шкипера (IY_LIVE_OK=1)"; exit 3
fi

if [ "$CMD" != status ] && [ "$(systemctl show -p WorkingDirectory --value "$UNIT")" != "$BASE/current" ]; then
  echo "служба $UNIT запускается не из $BASE/current — сперва переведи её на релизы (DEPLOY.md, «Первый раз»)"; exit 4
fi

health() {
  local body
  body="$(curl -fsS --max-time 10 "http://127.0.0.1:$PORT/api/health" 2>/dev/null || true)"
  if [[ "$body" =~ \"commit\"[[:space:]]*:[[:space:]]*\"([0-9a-f]+)\" ]]; then
    printf '%s\n' "${BASH_REMATCH[1]}"
  fi
}

switch_to() {
  local dir="$1" sha
  sha="$(git -C "$dir" rev-parse HEAD)"
  echo "GIT_SHA=$sha" > "$BASE/release.env"
  ln -sfn "$dir" "$BASE/current.tmp" && mv -Tf "$BASE/current.tmp" "$BASE/current"
  systemctl restart "$UNIT"
  for _ in $(seq 1 30); do
    [ "$(health 2>/dev/null || true)" = "$sha" ] && { echo "ok: $UNIT отвечает $sha"; return 0; }
    sleep 2
  done
  echo "ошибка: $UNIT не ответил коммитом $sha"; return 1
}

case "$CMD" in
  status)
    echo "current: $(readlink -f "$BASE/current" 2>/dev/null || echo нет)"
    echo "отвечает: $(health || echo нет ответа)" ;;
  deploy)
    mkdir -p "$BASE/releases"
    PREV="$(readlink -f "$BASE/current" 2>/dev/null || true)"
    TMP="$(mktemp -d "$BASE/releases/.new-XXXX")"
    trap 'rm -rf "$TMP"' ERR
    git clone -q "$REPO" "$TMP"
    git -C "$TMP" checkout -q "$REF"
    SHA="$(git -C "$TMP" rev-parse HEAD)"
    DIR="$BASE/releases/$(date -u +%Y%m%d-%H%M%S)-${SHA:0:7}"
    mv "$TMP" "$DIR"; trap - ERR
    ln -sfn /srv/imperialyachting/videos "$DIR/public/videos"
    # Живой ходит в свою базу по имени imperialyachting.com, поэтому собирается с hosts экземпляра,
    # как и работает (BindReadOnlyPaths в юните). Общий /etc/hosts сервера не трогается.
    BUILD='set -a && . "$ENVF" && set +a && GIT_SHA="$SHA" NODE_OPTIONS=--max-old-space-size=4096 nice -n 10 npx next build'
    [ -f "$BASE/hosts" ] && BUILD="mount --bind \"$BASE/hosts\" /etc/hosts && $BUILD"
    (cd "$DIR" && nice -n 10 npm ci --no-audit --no-fund >/dev/null \
      && ENVF="$ENVF" SHA="$SHA" unshare -m sh -c "$BUILD" > "$DIR/build.log" 2>&1) \
      || { echo "сборка упала, журнал: $DIR/build.log; отвечает прежний релиз"; exit 1; }
    if ! switch_to "$DIR"; then
      [ -n "$PREV" ] && { echo "откат на $PREV"; switch_to "$PREV"; }
      exit 1
    fi
    ls -1dt "$BASE"/releases/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf ;;
  rollback)
    CUR="$(readlink -f "$BASE/current")"
    PREV="$(ls -1dt "$BASE"/releases/*/ | sed 's#/$##' | grep -vx "$CUR" | head -1)"
    [ -n "$PREV" ] || { echo "предыдущего релиза нет"; exit 1; }
    switch_to "$PREV" ;;
  *) echo "команда: deploy [ref] | rollback | status"; exit 2 ;;
esac
