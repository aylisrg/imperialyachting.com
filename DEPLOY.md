# Выкатка imperialyachting.com

Vercel больше не используется. Сайт живёт на нашем сервере (Финский, `204.168.159.132`): Next.js через `next start` под systemd, перед ним nginx и имперский вход. Docker для сайта не нужен.

## Экземпляры

| Адрес | Что там | Служба | Порт | Папка | Данные | Кто видит |
|---|---|---|---|---|---|---|
| imperialyachting.com | живой сайт | `iy-boj` | 3481 | `/opt/imperialyachting/boj` | боевая Supabase, Stripe, письма | все |
| new.imperialyachting.com | превью нового дизайна, ветка `main` | `iy-new` | 3482 | `/opt/imperialyachting/new` | песочная Supabase, без Stripe и писем | только через имперский вход |

Видео главной лежат в `/srv/imperialyachting/videos/`: при сборке в каждый релиз ставится ссылка `public/videos`, в git их нет. Секреты лежат рядом с папкой экземпляра (`new.env`, `boj/site.env`), в репозиторий не попадают.

## Как выкатить

```
bash deploy/iy-deploy.sh new deploy            # собрать origin/main и переключить new
bash deploy/iy-deploy.sh new deploy <ветка|sha> # собрать другую ветку
bash deploy/iy-deploy.sh new status            # какой коммит отвечает
bash deploy/iy-deploy.sh new rollback          # вернуть предыдущий релиз
```

Скрипт клонирует репозиторий в `releases/<время>-<sha>`, собирает, переключает ссылку `current` и перезапускает службу. Новый релиз засчитывается, только если `/api/health` отвечает `"commit"` с его SHA. Если проверка не прошла, скрипт сам возвращает прежний релиз. Сломанная сборка не переключает ничего: отвечает прежний релиз. Хранятся три последних релиза (`IY_KEEP`).

Живой сайт: `IY_LIVE_OK=1 bash deploy/iy-deploy.sh live deploy <sha>`, и только после «да» Великого Шкипера. Без флага скрипт отказывает.

## Первый раз для живого

Сейчас `iy-boj` запускается из `/opt/imperialyachting/boj/site`, а не из `boj/current`, поэтому скрипт откажет с подсказкой. Перевод на релизы делается вместе с первой выкаткой нового дизайна на живой, после «да» Великого Шкипера: `ln -s site /opt/imperialyachting/boj/current`, в юните `WorkingDirectory=/opt/imperialyachting/boj/current` и `EnvironmentFile=-/opt/imperialyachting/boj/release.env`, затем `systemctl daemon-reload`.

## Кроны

`vercel.json` удалён: его кроны работали только на Vercel. На сервере их заменяют таймеры systemd живого сайта: `iy-boj-expire-holds` (03:00 UTC) и `iy-boj-balance-reminders` (06:00 UTC). Кроме того, GitHub Actions (`.github/workflows/booking-cron.yml`, `analytics-weekly.yml`, `ads-daily.yml`) дёргает `secrets.SITE_URL`, то есть тоже только живой сайт. У new кронов нет, руками их на new не вызывать.

## Проверка

- `bash deploy/iy-deploy.sh new status`: `отвечает` совпадает с `git rev-parse origin/main`.
- `curl -sI https://new.imperialyachting.com`: без входа отвечает переходом на имперский вход.
- `curl -s -r 0-100 -o /dev/null -w '%{http_code}' https://new.imperialyachting.com/videos/hero-vd40-speed-960.mp4` после входа: 206.

## Грабли

- Без `GIT_SHA` при сборке и в `release.env` `/api/health` отдаёт `"commit": null`, и скрипт посчитает выкатку проваленной.
- Живой собирается и работает с файлом `boj/hosts` (имя imperialyachting.com указывает на сам сервер, иначе сборка не дойдёт до своей базы). Скрипт делает это сам, если `hosts` лежит в папке экземпляра.
- Сборка без файла окружения падает на Supabase: скрипт подгружает env экземпляра сам, руками `next build` без него не запускать.
- Превью на боевом env означает настоящие заявки, оплаты и письма. Поэтому у new свой env с песочной базой.
