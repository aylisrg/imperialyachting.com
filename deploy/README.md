# Деплой на VPS (204.168.159.132)

Сайт работает в docker compose, видео отдаёт nginx из `/srv/imperialyachting/videos/` (блок `deploy/nginx-videos.conf`).
Секреты лежат в `/srv/imperialyachting/shared/.env.production`, скрипт их не печатает.

Порядок:
1. `bash deploy/vps-deploy.sh diagnose`: только чтение, показывает, чем запущен сайт.
2. `bash deploy/vps-deploy.sh deploy main`: сборка в `releases/<время>-<sha>`, переключение `current`, `nginx -t`, healthcheck. Если проверка не прошла, сам откатывается.
3. `bash deploy/vps-deploy.sh videos-check`: проверка, что `/videos` отвечает 206.

Откат одной командой: `bash deploy/vps-deploy.sh rollback`.
Переменные: `IY_BASE`, `IY_HEALTH_URL`, `IY_SITE_URL`, `IY_KEEP` (сколько релизов хранить).
