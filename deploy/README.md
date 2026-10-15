# Деплой на VPS (204.168.159.132)

Это docker-путь (`deploy/vps-deploy.sh`). Второй путь, systemd и `/opt/imperialyachting`, описан в `DEPLOY.md` и `deploy/iy-deploy.sh`. Они не заменяют друг друга: запускай тот, который совпал с `diagnose` и `systemctl status iy-boj`. `vercel.json` остаётся в репозитории.

Сайт в этой схеме работает в docker compose, видео отдаёт nginx из `/srv/imperialyachting/videos/` (блок `deploy/nginx-videos.conf`).
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

## Превью new
Отдельный экземпляр для new.imperialyachting.com, прод не трогает: проект `imperialyachting-preview`, папка `/srv/imperialyachting-preview` (свои `releases/` и `current`), порт 3001. Видео общие, из `/srv/imperialyachting/videos/`.

Команды по порядку:
1. DNS: A-запись `new` на `204.168.159.132`. Проверка: `dig +short new.imperialyachting.com`
2. Env: `sudo mkdir -p /srv/imperialyachting-preview/shared` и положить туда свой `.env.production`. Можно ссылку на продовый: `ln -s /srv/imperialyachting/shared/.env.production /srv/imperialyachting-preview/shared/.env.production` (тогда превью работает с теми же ключами и базой). Так же для `.env`, если он есть.
3. Nginx:
   `sudo cp deploy/nginx-videos.conf /etc/nginx/snippets/imperial-videos.conf`
   `sudo cp deploy/nginx-preview.conf /etc/nginx/sites-available/new.imperialyachting.com`
   `sudo ln -s ../sites-available/new.imperialyachting.com /etc/nginx/sites-enabled/`
   `sudo nginx -t && sudo systemctl reload nginx`
4. TLS: `sudo certbot --nginx -d new.imperialyachting.com`
5. Деплой: `bash deploy/vps-deploy.sh --preview deploy <ветка>`
6. Видео: `bash deploy/vps-deploy.sh --preview videos-check`

Откат превью: `bash deploy/vps-deploy.sh --preview rollback`. Без `--preview` все команды работают с продом как раньше.

### Превью: образ, кроны, общие данные
- Превью собирается в свой образ `imperialyachting-preview` (переменная `IY_IMAGE`). Prune и rollback превью трогают только свои релизы и теги, прод не задевают.
- Внутри контейнера кронов нет: нет node-cron и фоновых setInterval на сервере. Кроны дёргают снаружи GitHub Actions (`booking-cron.yml`: expire-holds каждые 15 минут и balance-reminders в 06:00 UTC; `analytics-weekly.yml`; `ads-daily.yml`) по секрету `SITE_URL`, то есть только прод. `vercel.json` crons работают только на Vercel. Поэтому на превью кроны сами не запускаются, флаг вроде `DISABLE_CRON` не нужен (код такой флаг и не поддерживает). Не меняйте `SITE_URL` на new и не вызывайте `/api/cron/*` на превью руками.
- Если `.env.production` превью это ссылка на продовый, превью работает с той же базой Supabase и тем же Stripe, что и прод. Заявки, брони, оплаты и письма с превью настоящие. Тестировать только на тестовом контакте. Для изоляции дайте превью свой env с тестовыми ключами Stripe.
