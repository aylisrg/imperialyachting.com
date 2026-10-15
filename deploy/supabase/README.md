# Свой Supabase на VPS (204.168.159.132)

Без Supabase Cloud. Стек `supabase/docker`, урезанный до db, kong, auth, rest, storage, meta (studio по желанию). Всё слушает только `127.0.0.1`, наружу открыт только nginx `db.imperialyachting.com` и только пути `/rest/v1/`, `/auth/v1/`, `/storage/v1/`. Postgres наружу не открыт вообще.
Код сайта не меняется: меняются только `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Секреты: `/srv/imperialyachting/shared/supabase.env` (стек) и `shared/supabase-app.env` (ключи для сайта), права 600. Скрипты их не печатают.
Данные: `/srv/imperialyachting/supabase-data/{db,storage}`. Бэкапы: `/srv/imperialyachting/backups`.

## Порядок (Илья)
1. DNS: A-запись `db` на `204.168.159.132`. Проверка: `dig +short db.imperialyachting.com`
2. Код на сервер:
   `sudo git clone https://github.com/aylisrg/imperialyachting.com /srv/imperialyachting/infra && cd /srv/imperialyachting/infra && sudo git checkout infra/self-hosted-supabase`
   (после мержа: `git checkout main && git pull`). Нужны `docker compose`, `openssl`, `jq`, `curl`.
3. Секреты и запуск:
   `bash deploy/supabase/supabase-setup.sh init` (один раз, существующий файл не перезаписывает)
   `bash deploy/supabase/supabase-setup.sh up`
   В `status` должно быть: `/rest/v1/ -> 200`, `/auth/v1/health -> 200`.
4. Nginx и TLS:
   `sudo cp deploy/supabase/nginx-db.conf /etc/nginx/sites-available/db.imperialyachting.com`
   `sudo ln -s ../sites-available/db.imperialyachting.com /etc/nginx/sites-enabled/`
   `sudo nginx -t && sudo systemctl reload nginx`
   `sudo certbot --nginx -d db.imperialyachting.com`
   Проверка: `curl -s -o /dev/null -w '%{http_code}\n' https://db.imperialyachting.com/auth/v1/health` даёт 401 (нет ключа, значит kong жив).
5. Схема: сначала `bash deploy/supabase/migrate.sh --dry-run` (всё в одной транзакции, ROLLBACK). Если OK: `bash deploy/supabase/migrate.sh` (перед применением сам делает бэкап). Скрипт сначала применяет `supabase/schema.sql` (яхты, цены, destinations: это состояние миграции 001) и помечает 001 выполненной, затем date-файлы, затем 002.. Повторный запуск пропускает применённые файлы. Storage должен быть уже поднят (шаг 3): в schema.sql есть `storage.buckets`.
6. Данные из облака (облако только читается). Строку подключения не писать в чат и в историю shell:
   `read -rs SUPABASE_CLOUD_DB_URL && export SUPABASE_CLOUD_DB_URL`
   `read -rs SUPABASE_CLOUD_SERVICE_KEY && export SUPABASE_CLOUD_SERVICE_KEY`
   `export SUPABASE_CLOUD_URL=https://<ref>.supabase.co`
   `bash deploy/supabase/data-copy.sh all --yes`
   Скрипт: бэкап локальной базы, данные public + пользователи auth, все файлы бакетов (yacht-photos, destination-photos, sale-media, sale-materials и прочие), счётчики строк. В конце список полей, где ещё ссылки на `*.supabase.co`.
7. Превью на новую базу: `bash deploy/supabase/supabase-setup.sh app-env preview`, затем `bash deploy/vps-deploy.sh --preview deploy main`.
8. Смоук на new.imperialyachting.com: главная и флот с фото, страница яхты, вход в админку по почте, загрузка фото в админке, заявка с тестового контакта, `/api/health`.
9. Прод: `bash deploy/supabase/supabase-setup.sh app-env prod`, `bash deploy/vps-deploy.sh deploy main`, тот же смоук. Если за время проверки в облаке появились новые заявки или брони, перед шагом 9 повторить шаг 6 (`data-copy.sh db --yes`).
10. Ночной бэкап (root crontab, хранится 14 дней, `IY_BACKUP_KEEP_DAYS`):
    `30 3 * * * /srv/imperialyachting/infra/deploy/supabase/backup.sh >> /srv/imperialyachting/backups/backup.log 2>&1`

## Откат
`bash deploy/supabase/supabase-setup.sh app-env-rollback preview` (или `prod`) возвращает старый env с облачными ключами, затем деплой той же командой. Облако не трогаем, пока прод не отработал на новой базе минимум неделю.

## Studio (по желанию)
`docker compose -p supabase --env-file /srv/imperialyachting/shared/supabase.env -f deploy/supabase/docker-compose.yml --profile studio up -d studio`, открыть через `ssh -L 3010:127.0.0.1:3010 root@204.168.159.132` и http://localhost:3010.

## Риски
- Пользователи auth переносятся вместе с хешами паролей и identities. Сессии в браузерах сбросятся (другой JWT секрет), админам нужно войти заново. Если версия схемы auth в облаке новее, чем у gotrue здесь, вставка упадёт по лишней колонке: тогда пишите, подгоним версию образа.
- Ссылки на файлы, сохранённые в базе как полный URL `https://<ref>.supabase.co/storage/...`, продолжат вести в облако. Шаг 6 их перечисляет. Замену на `https://db.imperialyachting.com` делаем отдельным SQL после проверки превью, не раньше.
- Письма magic link идут через SMTP из `supabase.env` (заполнить SMTP_*), встроенной почты Supabase здесь нет.
- Если схема облака менялась руками мимо миграций, копия данных упадёт на несовпадающей колонке. Это и есть проверка, ничего не сломается: транзакция откатится.
- 011 и 013 уже в `main` и входят в `migrate.sh`. Если в облаке их ещё не применяли, копия данных приедет без этих правок: примените их в облаке до шага 6 или повторите `data-copy.sh db --yes` после.
