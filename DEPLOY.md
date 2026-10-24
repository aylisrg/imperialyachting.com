# Выкатка imperialyachting.com (systemd)

Живой сайт на 2026-10-15 отвечает с `nginx/1.30.0`, не с Vercel. `/api/health` на проде без поля `commit` (сборка старше `GIT_SHA`). Имя `new.imperialyachting.com` снаружи не резолвится. Перед выкаткой смотри, чем процесс запущен на самом деле, и запускай только совпавший скрипт.

В репозитории два разных пути, этот PR второй не удаляет:

| Скрипт | Схема | Когда |
|---|---|---|
| `deploy/vps-deploy.sh`, `deploy/README.md` | Docker Compose, `/srv/imperialyachting`, порты 3000 и 3001 | путь из #47 |
| `deploy/iy-deploy.sh`, этот файл | systemd, `next start`, `/opt/imperialyachting`, порты 3481 и 3482 | если на сервере службы `iy-boj` / `iy-new` |

Проверка: `bash deploy/vps-deploy.sh diagnose` и `systemctl status iy-boj iy-new`. Не запускай docker-скрипт, если слушает systemd, и наоборот.

Сервер: Финский, `204.168.159.132`. Перед nginx имперский вход. Docker для схемы из этой страницы не нужен.

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

`vercel.json` не удаляем. Его кроны (`/api/cron/expire-holds` в 03:00 UTC, `/api/cron/balance-reminders` в 06:00 UTC) работают только на Vercel. На сервере те же маршруты должны звать таймеры `iy-boj-expire-holds` и `iy-boj-balance-reminders`, но юнитов в репозитории нет, и пока они не включены на сервере, единственное описание кронов в git это `vercel.json`.

GitHub Actions (`.github/workflows/booking-cron.yml`, `analytics-weekly.yml`, `ads-daily.yml`) ходят в `secrets.SITE_URL`, то есть только на живой сайт. `booking-cron.yml` выключен вручную. У new кронов нет, руками их на new не вызывать.

## Проверка

- `bash deploy/iy-deploy.sh new status`: `отвечает` совпадает с `git rev-parse origin/main`.
- `curl -sI https://new.imperialyachting.com`: без входа отвечает переходом на имперский вход.
- `curl -s -r 0-100 -o /dev/null -w '%{http_code}' https://new.imperialyachting.com/videos/hero-vd40-speed-960.mp4` после входа: 206.

## Грабли

- Без `GIT_SHA` при сборке и в `release.env` `/api/health` отдаёт `"commit": null`, и скрипт посчитает выкатку проваленной.
- Живой собирается и работает с файлом `boj/hosts` (имя imperialyachting.com указывает на сам сервер, иначе сборка не дойдёт до своей базы). Скрипт делает это сам, если `hosts` лежит в папке экземпляра.
- Сборка без файла окружения падает на Supabase: скрипт подгружает env экземпляра сам, руками `next build` без него не запускать.
- Превью на боевом env означает настоящие заявки, оплаты и письма. Поэтому у new свой env с песочной базой.
