# HANDOFF: imperialyachting.com, передача новой команде

Составлено 14.10.2026 только по репо, PR и issues. Статусы PR на 14.10.2026 10:30 (Дубай), сверять с GitHub по факту. «Не проверено» = в репо нет подтверждения.

## 1. Что уже в main
- Редизайн Wake (#46): #48 главная, #49 услуги + 5 страниц услуг, #50 флот + страница яхты, #51 контакты, #57 About.
- #41 analytics: закрыт anon-доступ к отчётам (миграция `012_analytics_rls_authenticated.sql`), падение при отсутствии секретов.
- #52 `/api/health` отдаёт SHA сборки (`commit`), на это опирается `deploy/vps-deploy.sh`.
- Ранее: #45 Speedboat Transfer, #37–#40 yachts-for-sale, #35 MCP + Stripe-бронирование, #34 Meta Ads, #30/#31 портал документов и др.
- Манифест клипов: `src/data/clips.ts`.

## 2. Открытые PR
| PR | Статус | Что | Что блокирует |
|---|---|---|---|
| #43 | draft | Docs: доступ по magic-link на почту, миграция `013_document_access.sql` | Мерджить только после переезда на VPS (#44 Q2). Нужен SMTP/почта на целевом хосте |
| #47 | draft | Self-host на VPS: standalone + Docker, `deploy/` (vps-deploy.sh, nginx-videos.conf, nginx-preview.conf), убран `@vercel/speed-insights` | Меняет не только deploy/ (next.config, layout, Dockerfile, package.json). Ждёт PASS от QA |
| #53 | draft | Миграция `011_fix_moneta_capacity_builder.sql` (Moneta: 18 гостей, Monte Carlo Yachts) | Применить на БД VPS после бэкапа |
| #55 | draft | `deploy/supabase/`: self-hosted Supabase (план в #54) | Живой запуск стека не делался. Должен подтянуть main после #47 |
| #56 | ready, MERGEABLE | Папка `design/` (гайды, макеты, ревью, постеры) | **Мерджить только squash**: в истории ветки ~99 МБ видео прототипа |
| #58 | draft, MERGEABLE (head 60b994b, база main) | Destinations (#46) | Ревью QA/дизайна. Rebase не нужен, force-push не делать |
| #59 | draft, MERGEABLE (head 40806b6) | Blog (#46), стек на #58 | После #58 |
| #60 | draft, MERGEABLE (head a00d215) | Partners (#46), стек на #59, блок партнёров скрыт | После #59; список партнёров от владельца |
| #61 | draft | Guard клипов: без `NEXT_PUBLIC_CLIP_BASE_URL` сборка пишет WARNING в лог, сайт показывает только постеры | Перед мержем выставить переменную (раздел 5) |
| #42 | open | Privacy policy: Stripe, международные передачи, адрес офиса | Не разбирался, статус не проверен |

Стек редизайна: #58, затем #59, затем #60, обычный merge (не squash), по порядку. После каждого мержа следующий PR перенацелить на main.

## 3. Инфраструктура
- Прод VPS: `204.168.159.132` (Финляндия). Сайт в docker compose за nginx, проект `imperialyachting`, порт 3000. Превью `new.imperialyachting.com`: `/srv/imperialyachting-preview`, порт 3001.
- Видео: `/srv/imperialyachting/videos/`, 48 файлов (12 клипов × 1920/960 × mp4/webm), отдаёт nginx (snippet `deploy/nginx-videos.conf`). Количество файлов на сервере отсюда не проверено.
- Секреты сайта: `/srv/imperialyachting/shared/.env.production`. Supabase: `shared/supabase.env`, `shared/supabase-app.env` (600).
- Vercel: проект ещё подключён (превью-деплои PR). `vercel.json` crons работают только на Vercel. Кроны для VPS дёргают GitHub Actions (`booking-cron.yml`, `analytics-weekly.yml`, `ads-daily.yml`) по секрету `SITE_URL`.
- Решение Ильи: **Supabase Cloud для нового сайта не используется, всё на VPS.** Облако только читается при переносе и не удаляется минимум неделю после переключения прода.

## 4. Шаги на сервере (по порядку)
Источник: README в #55 (`deploy/supabase/README.md`) и `deploy/README.md` из #47. Лучше выполнять после мержа #47 и #55 с ветки main.

0. DNS: A `db.imperialyachting.com` → `204.168.159.132` (и `new` для превью). Проверка `dig +short db.imperialyachting.com`.
1. Клон репо (первым делом):
   ```
   sudo git clone https://github.com/aylisrg/imperialyachting.com /srv/imperialyachting/infra
   cd /srv/imperialyachting/infra && sudo git checkout infra/self-hosted-supabase   # после мержа: main
   ```
   Нужны `docker compose`, `openssl`, `jq`, `curl`. Ветка #55 не содержит файлов #47. До мержа #47 выполнить:
   `sudo git fetch origin pull/47/head:pr47 && sudo git checkout pr47 -- deploy/vps-deploy.sh deploy/nginx-videos.conf deploy/nginx-preview.conf deploy/README.md`
2. Видео:
   ```
   sudo cp deploy/nginx-videos.conf /etc/nginx/snippets/imperial-videos.conf
   # в server 443 сайта, выше "location /": include /etc/nginx/snippets/imperial-videos.conf;
   sudo nginx -t && sudo systemctl reload nginx
   bash deploy/vps-deploy.sh videos-check    # ждём 206
   ```
   Превью new (после snippet videos, конфиг превью его подключает; env превью см. `deploy/README.md` #47):
   ```
   sudo cp deploy/nginx-preview.conf /etc/nginx/sites-available/new.imperialyachting.com && sudo ln -s ../sites-available/new.imperialyachting.com /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx && sudo certbot --nginx -d new.imperialyachting.com
   ```
3. Supabase:
   ```
   bash deploy/supabase/supabase-setup.sh init
   # заполнить в shared/supabase.env: SMTP_ADMIN_EMAIL, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
   bash deploy/supabase/supabase-setup.sh up
   bash deploy/supabase/supabase-setup.sh status   # /rest/v1/ -> 200, /auth/v1/health -> 200
   ```
   Без SMTP не будет входа в админку по почте (смоук, шаг 8). Если SMTP заполнили после `up`, ещё раз `supabase-setup.sh up`.
4. Nginx + TLS для db:
   ```
   sudo cp deploy/supabase/nginx-db.conf /etc/nginx/sites-available/db.imperialyachting.com
   sudo ln -s ../sites-available/db.imperialyachting.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d db.imperialyachting.com
   ```
5. Схема: `bash deploy/supabase/migrate.sh --dry-run`, если OK `bash deploy/supabase/migrate.sh` (сам делает бэкап).
6. Данные из облака, секреты только через `read -rs`, не в чат и не в историю:
   ```
   read -rs SUPABASE_CLOUD_DB_URL && export SUPABASE_CLOUD_DB_URL
   read -rs SUPABASE_CLOUD_SERVICE_KEY && export SUPABASE_CLOUD_SERVICE_KEY
   export SUPABASE_CLOUD_URL=https://<ref>.supabase.co
   bash deploy/supabase/data-copy.sh all --yes
   ```
   **Шаги 7 и 9 только после мержа #47 в main** (`deploy main` собирает образ из main, Dockerfile и standalone есть только в #47). До деплоя добавить `NEXT_PUBLIC_CLIP_BASE_URL` (раздел 5).
7. Превью: `bash deploy/supabase/supabase-setup.sh app-env preview`, затем `bash deploy/vps-deploy.sh --preview deploy main`.
8. QA-смоук на new: главная и флот с фото, яхта, вход в админку по почте, загрузка фото, заявка, `/api/health`.
9. Прод: `bash deploy/supabase/supabase-setup.sh app-env prod`, `bash deploy/vps-deploy.sh deploy main`, тот же смоук. Если в облаке появились новые заявки, перед этим `data-copy.sh db --yes`.
10. SMTP_* уже заполнены в шаге 3 (встроенной почты нет).
11. Бэкап (root crontab, 14 дней):
    `30 3 * * * /srv/imperialyachting/infra/deploy/supabase/backup.sh >> /srv/imperialyachting/backups/backup.log 2>&1`
12. Откат: `bash deploy/supabase/supabase-setup.sh app-env-rollback preview|prod` и деплой той же командой. Откат релиза: `bash deploy/vps-deploy.sh [--preview] rollback`.

Прочее:
- Полный `next build` требует живой Supabase: `/fleet` пререндерится из БД (`revalidate = 3600`).
- `/api/health` с `destinations: 0` значит пустую таблицу `public.destinations`, не ошибку кода: страницы берут статичный `src/data/destinations.ts` (https://github.com/aylisrg/imperialyachting.com/issues/54#issuecomment-6161358268). `data-copy.sh` заполнит таблицу, только если она не пуста в облаке (не проверено). Сида destinations в миграциях нет.

Риски из README #55: после переключения все админы входят заново (magic link на почту); ссылки `*.supabase.co` перечисляет `data-copy.sh` в конце вывода, заменить их на `https://db.imperialyachting.com` отдельным SQL после смоука превью; первый деплой без релизов не откатывается автоматически (см. `deploy/README.md`).

## 5. Переменные окружения (значения не приводятся)
- `NEXT_PUBLIC_CLIP_BASE_URL=/videos`: **везде**: Vercel (Production и Preview), `/srv/imperialyachting/shared/.env.production` и `/srv/imperialyachting-preview/shared/.env.production` (если это не ссылка на продовый). Вшивается при сборке, поэтому добавить до деплоя в шагах 7/9. Иначе после #61 только постеры.
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (на VPS ставит `app-env`).
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`.
- Google: `GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `GOOGLE_ANALYTICS_PROPERTY_ID`.
- Почта: `RESEND_API_KEY`, `BOOKING_FROM_EMAIL`, `BOOKING_ADMIN_EMAIL`.
- Кроны: `BOOKING_CRON_SECRET`, `CRON_SECRET`, `ANALYTICS_CRON_SECRET`.
- Аналитика: `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- SEO: `INDEXNOW_KEY`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`.
- Прочее: `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, `NEXT_PUBLIC_MCP_URL`, `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_BUSINESS_ACCOUNT_ID`, `YOUTUBE_CHANNEL_ID`, `DOCUMENTS_PASSWORD`, `DOCUMENTS_SESSION_SECRET`, `SALES_ADMIN_TOKEN`, `SALES_NOTIFY_EMAIL`, `SALES_FILE_SECRET`.
- Из #47: `TRUST_CF_IPCOUNTRY`, `COUNTRY_HEADER`. Из #43/#44: `PMS_CONTACTS_WEBHOOK_URL` (полный список в `.env.example` ветки #43).
- GitHub Actions secrets: `SITE_URL`, `BOOKING_CRON_SECRET` (прочие не проверены).

## 6. Миграции
Применяются вручную, на БД VPS, после бэкапа (`migrate.sh` делает его сам). Порядок `migrate.sh`: date-файлы, затем 001.. (012 зависит от `20260224_analytics_tables.sql`).
1. `011_fix_moneta_capacity_builder.sql` (#53, не в main)
2. `012_analytics_rls_authenticated.sql` (#41, в main)
3. `013_document_access.sql` (#43, не в main)
После мержа #53/#43: `cd /srv/imperialyachting/infra && sudo git pull`, затем `bash deploy/supabase/migrate.sh --dry-run` и `bash deploy/supabase/migrate.sh` (или `--only 011_fix_moneta_capacity_builder.sql`). `migrate.sh` берёт файлы из `supabase/migrations` текущего чекаута.
Если 011 смерджат после копии данных, повторить `data-copy.sh db --yes` или применить 011 и в облаке.

## 7. Открытые вопросы к владельцу
- #44 PMS (комментарий https://github.com/aylisrg/imperialyachting.com/issues/44#issuecomment-6162175227): какая PMS, метод и авторизация, маппинг полей, список исключений, текст согласия/PDPL. #44 строится на #43.
- #46 (комментарий 6159819808): можно ли «No commissions» в hero Partners; какие партнёры согласны быть в списке; актуальны ли факты Dock & Dine (DMA с 09.2025, 20 марин, 1 час бесплатно). Пока нейтральные версии без цифр.
- #56 (комментарии): Evo 43 во флоте, цены чартера, утверждения в FAQ, формулировки management, реальное портфолио, часы работы, цена speedboat; цифры Dock & Dine на макетах gen2 заменить.
- Evo 43: в коде и FAQ причал Marasi Bay (`src/data/home.ts`, `src/data/faq.ts`), подтверждения владельца в репо нет.
