# Деплой на VPS (204.168.159.132)

Сайт работает в docker compose, видео отдаёт nginx из `/srv/imperialyachting/videos/` (блок `deploy/nginx-videos.conf`).
Секреты лежат в `/srv/imperialyachting/shared/.env.production`, скрипт их не печатает.

Порядок:
1. `bash deploy/vps-deploy.sh diagnose`: только чтение, показывает, чем запущен сайт.
2. `bash deploy/vps-deploy.sh deploy main`: сборка в `releases/<время>-<sha>`, переключение `current`, `nginx -t`, healthcheck. Если проверка не прошла, сам откатывается.
3. `bash deploy/vps-deploy.sh videos-check`: проверка, что `/videos` отвечает 206.

Откат одной командой: `bash deploy/vps-deploy.sh rollback`.
Переменные: `IY_BASE`, `IY_HEALTH_URL`, `IY_SITE_URL`, `IY_KEEP` (сколько релизов хранить).

## Проверка здоровья
Деплой считается успешным, только если контейнер проекта `imperialyachting` запущен из образа нового релиза и `/api/health` отдаёт `"commit"` с полным SHA этого релиза (образ собирается с `--build-arg GIT_SHA=<sha>`). Ответ старого сайта не засчитывается. Если поля `commit` нет, значит ref старее PR с этим полем: деплойте ref, где оно есть.

## Первый деплой
Если в `releases/` ещё пусто, автоматический откат невозможен. Скрипт пишет `FIRST DEPLOY` и показывает старый процесс сайта (docker не из проекта `imperialyachting`, pm2, systemd, кто занял порт 3000). Если старый процесс держит порт 3000, остановите его до деплоя, иначе новый контейнер не стартует.

Если первый деплой упал:
1. Остановить новый: `cd /srv/imperialyachting/current && docker compose -p imperialyachting down`
2. Поднять старый, смотря что показал `diagnose`:
   - docker compose: `cd <старая папка> && docker compose up -d`
   - pm2: `pm2 restart <имя>` или `pm2 resurrect`
   - systemd: `sudo systemctl start <юнит>`
3. Проверить: `curl -sI https://imperialyachting.com`

Старые релизы сверх `IY_KEEP` удаляются вместе с их образами (`docker image rm`). Временная папка `.new-XXXX` удаляется при любой ошибке.
