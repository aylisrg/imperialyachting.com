#!/bin/bash
# IY-1772 (Верстальщик): автовыкатка main из GitHub на песочницу https://iy-new.sazanoff.ru (служба iy-new, порт 3482).
# Новый коммит в main → сборка рядом, в отдельной папке выпуска → переключение ссылки current → проверка страниц.
# Упала сборка — песочница остаётся на прежней; не открылись страницы после переключения — ссылка возвращается назад.
# Удаляет только старые папки выпусков в releases/ сверх трёх последних (собираются заново из GitHub);
# текущую и прежнюю не трогает никогда. Живой сайт (iy-boj, boj/site) этот скрипт не трогает.
set -u
NEW=/opt/imperialyachting/new
REPO=https://github.com/aylisrg/imperialyachting.com
LOG=$NEW/avtovykatka.log
STRANICY="/ /careers /yachts-for-sale"

exec 9>"$NEW/.avtovykatka.lock"
flock -n 9 || exit 0
log() { echo "$(date -u '+%F %T') $*" >> "$LOG"; }

SHA=$(GIT_TERMINAL_PROMPT=0 timeout 30 git ls-remote "$REPO" refs/heads/main | cut -c1-40)
[ ${#SHA} -eq 40 ] || { log "main на GitHub не прочитан"; exit 1; }
[ "$SHA" = "$(cat "$NEW/vykacheno" 2>/dev/null)" ] && exit 0
# сборка этого коммита уже падала — не повторять каждые 2 минуты, ждать следующего коммита
[ -f "$NEW/neudacha/$SHA" ] && exit 0

ZANYATO=$(df --output=pcent / | tail -1 | tr -dc 0-9)
SVOBODNO=$(df --output=avail -BG / | tail -1 | tr -dc 0-9)
if [ "$ZANYATO" -gt 85 ] || [ "$SVOBODNO" -lt 6 ]; then
  log "$SHA: место на диске — занято ${ZANYATO}%, свободно ${SVOBODNO}G; сборку не начинаю"; exit 1
fi

DIR="$NEW/releases/$(date -u +%Y%m%d-%H%M%S)-${SHA:0:7}"
log "$SHA: новый коммит main, собираю в $DIR"
neudacha() { mkdir -p "$NEW/neudacha"; echo "$(date -u '+%F %T') $1" > "$NEW/neudacha/$SHA"; log "$SHA: НЕ ВЫКАЧЕНО — $1"; exit 1; }

GIT_TERMINAL_PROMPT=0 timeout 300 git clone -q --depth 1 --branch main "$REPO" "$DIR" || neudacha "не скачан"
[ "$(git -C "$DIR" rev-parse HEAD)" = "$SHA" ] || log "$SHA: main сдвинулся во время скачивания, собираю $(git -C "$DIR" rev-parse HEAD)"
SHA=$(git -C "$DIR" rev-parse HEAD)
cd "$DIR" || neudacha "нет папки"
# Зависимости не менялись — берём их у текущего выпуска жёсткими ссылками: выпуск весит 1.6G, из них
#   почти всё node_modules, а диск Финского занят на 85%.
TEK=$(readlink -f "$NEW/current")
ZAVISIMOSTI="npm ci --no-audit --no-fund"
if [ -d "$TEK/node_modules" ] && cmp -s "$TEK/package-lock.json" "$DIR/package-lock.json"; then
  cp -al "$TEK/node_modules" "$DIR/node_modules" && ZAVISIMOSTI="true" && log "$SHA: зависимости те же — ссылками из $TEK"
fi
(
  set -a; . /opt/imperialyachting/boj/site.env; set +a
  export GIT_SHA=$SHA NODE_OPTIONS=--max-old-space-size=3072 NEXT_TELEMETRY_DISABLED=1
  timeout 1200 $ZAVISIMOSTI && timeout 1800 npx next build
) > "$DIR/build.log" 2>&1 || neudacha "сборка упала, журнал $DIR/build.log"

PREV=$(readlink -f "$NEW/current")
cp -p "$NEW/release.env" "$NEW/release.env.prev" 2>/dev/null
echo "GIT_SHA=$SHA" > "$NEW/release.env"
ln -sfn "$DIR" "$NEW/current.tmp" && mv -T "$NEW/current.tmp" "$NEW/current"
systemctl restart iy-new

proverka() {
  for i in $(seq 1 30); do
    curl -s -o /dev/null -m 10 -w '%{http_code}' http://127.0.0.1:3482/ | grep -q 200 && break; sleep 3
  done
  for s in $STRANICY; do
    k=$(curl -s -o /dev/null -m 30 -w '%{http_code}' "http://127.0.0.1:3482$s")
    [ "$k" = 200 ] || { echo "$s ответила $k"; return 1; }
  done
}
if ! PRICHINA=$(proverka); then
  ln -sfn "$PREV" "$NEW/current.tmp" && mv -T "$NEW/current.tmp" "$NEW/current"
  cp -p "$NEW/release.env.prev" "$NEW/release.env" 2>/dev/null
  systemctl restart iy-new
  neudacha "после переключения $PRICHINA — песочница возвращена на $PREV"
fi
echo "$SHA" > "$NEW/vykacheno"
log "$SHA: ВЫКАЧЕНО на песочницу, прежняя папка $PREV"

# старые выпуски: оставить три последних, текущий и прежний не трогать
ls -1d "$NEW"/releases/*/ 2>/dev/null | sed 's:/$::' | sort -r | tail -n +4 | while read -r d; do
  [ "$(readlink -f "$d")" = "$(readlink -f "$NEW/current")" ] && continue
  [ "$(readlink -f "$d")" = "$PREV" ] && continue
  rm -rf -- "$d" && log "удалён старый выпуск $d"
done
exit 0
