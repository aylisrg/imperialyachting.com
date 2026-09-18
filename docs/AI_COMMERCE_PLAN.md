# План: MCP-сервер, агентское бронирование через Stripe и AI-видимость imperialyachting.com

## Контекст

Цель: любой ИИ-ассистент (ChatGPT, Claude, Perplexity, Gemini) должен уметь показать флот, проверить даты, собрать смету с доп. услугами и довести клиента до оплаты. Параллельно сайт должен лучше цитироваться в AI-выдаче и Google.

Решения владельца (подтверждены):
- Занятость яхт ведётся в **Google Calendar, отдельный календарь на яхту**.
- Оплата: **депозит 50%** через Stripe Checkout, остаток вторым линком за 48 ч (по Terms).
- Доп. услуги: **стартовый прайс придумать** (6–8 позиций), редактируется в админке.
- MCP первого релиза **без авторизации**: публичные read-only инструменты + hosted Stripe-ссылка.

### Что есть сейчас (ревью)

Стек: Next.js 16.1 App Router, React 19, Supabase (anon key + RLS), Vercel, Tailwind 4, Zod 4, vitest. Деплой — Vercel, CI только cron-аналитика (нет lint/test workflow).

Данные (`supabase/schema.sql`, `src/lib/yachts-db.ts`, `src/types/yacht.ts`):
- `yachts` + дочерние `yacht_pricing` (season/period — свободный текст, hourly/daily/weekly/monthly + B2B, все в AED неявно), `yacht_images`, `yacht_specs`, `yacht_amenities`, `yacht_included`. `destinations` (category destination/experience/activity).
- **Нет** таблиц bookings / availability / extras / customers / leads. Нет `min_hours`, нет сезонов по датам, нет service-role клиента Supabase.
- Прайсинг: `src/lib/pricing.ts` — только `getLowestPrice`/`getHourlyRate`. Расчёт «часы × ставка, 4+1 бонус» живёт в клиентском `src/components/pricing/PriceConstructor.tsx` и уходит в WhatsApp-ссылку. Правила депозита 50% / остаток за 48 ч / отмены — только прозой в `src/app/terms/page.tsx`.
- Контакт-форма `src/components/forms/ContactForm.tsx` **никуда не отправляет** (fake delay + GA-событие).
- API: `src/app/api/analytics/*` (bearer-секрет, два роута без auth, один мутирующий), `documents/*` (HMAC-cookie), `health`. Нет rate limiting, нет Zod-валидации тел запросов, нет CORS.
- Stripe / calendar / MCP / llms.txt — 0 упоминаний в коде.

SEO (`src/app/layout.tsx`, `src/components/seo/schemas.ts`, `public/robots.txt`, `src/app/sitemap.ts`):
- Хорошо: metadata на всех страницах, canonical, OG-картинки, JSON-LD (Organization, LocalBusiness, WebSite, Product+Offer, FAQPage, BreadcrumbList, Service, TouristDestination), динамический sitemap, robots.txt с явным Allow для GPTBot/ClaudeBot/PerplexityBot/OAI-SearchBot.
- Пробелы: нет `llms.txt`; Product Offer публикует только минимальную **дневную** цену (без hourly/AggregateOffer); `organizationSchema` без `@id` (dangling `#organization` в WebSite); два LocalBusiness-узла с разными адресами; `aggregateRating` без `Review`; robots.txt не упоминает `Claude-SearchBot`, `Claude-User`, `Applebot-Extended`, `meta-externalagent`; нет verification-токенов GSC/Bing; sitemap `lastModified` = время билда; hreflang self-referencing (нет RU/AR); **ноль статей в блоге**, `/blog` показывает фейковые видео-карточки при пустом `YOUTUBE_CHANNEL_ID`; FAQPage одинаковый на всех яхтах.

### Лучшие практики (ресерч, сентябрь 2026)

- MCP spec **2026-07-28**: stateless core, Streamable HTTP, старый SSE deprecated. Состояние между вызовами — явный handle (`quote_id`), а не сессия. Аннотации `readOnlyHint/destructiveHint/idempotentHint/openWorldHint` + `title` обязательны для листинга в каталогах Claude/ChatGPT. `outputSchema` + `structuredContent`. MCP Apps (`_meta.ui.resourceUri`) для карточки яхты — опционально позже.
- Хостинг на Vercel: `mcp-handler@^2` + `@modelcontextprotocol/server@^2` + `zod@^4`, роут `app/api/mcp/route.ts`, без Redis.
- Подключение: ChatGPT Developer mode (URL, no-auth ок; write-инструменты требуют подтверждения без `readOnlyHint`), Claude custom connectors (публичный URL), Perplexity custom connector (Pro/Max). Листинг в каталогах требует OAuth/Team-аккаунт — фаза 2.
- Stripe: hosted **Checkout Session** (не Payment Links, не PaymentIntents) с `client_reference_id = booking_id`, `expires_at` = время hold, `Idempotency-Key` от `quote_id`, фулфилмент только из вебхука `checkout.session.completed`, release hold по `checkout.session.expired`. Агентские протоколы (OpenAI ACP/Instant Checkout, Google AP2/UCP, Stripe Agentic Commerce Suite) — US-ориентированы, для ОАЭ пока недоступны; MCP — реальный канал.
- GEO: Google не требует спец-разметки для AI Overviews; **FAQ rich results отключены с мая 2026** (разметка безвредна, но не даёт бонуса). Важны LocalBusiness, BreadcrumbList, Organization sameAs, Product/Service+Offer с ценами, соответствие разметки видимому контенту, свежесть, E-E-A-T, IndexNow для Bing (питает ChatGPT search и Copilot). llms.txt — дёшево, но без доказанного эффекта на ранжирование.
- Календарь: своя таблица `bookings` как источник правды + Google Calendar `freebusy` для чтения занятости и `events.insert` для записи подтверждённых броней.

---

## Архитектура (целевая)

```
AI-клиент (ChatGPT / Claude / Perplexity)
   │  Streamable HTTP, no-auth
   ▼
/api/mcp  (mcp-handler)  ──►  src/lib/booking/*  ──►  Supabase (service role)
   tools: list_yachts, get_yacht,         │                 yachts, extras, bookings
          list_destinations, list_extras, │
          check_availability, create_quote,│──►  Google Calendar (freebusy / events)
          create_checkout, get_booking     │
                                          └──►  Stripe Checkout Session (hosted URL)
/api/stripe/webhook ◄── Stripe: completed → booking=deposit_paid, GCal event, email/Telegram
                                  expired  → release hold
/api/booking/*  ── те же функции для сайта (заменяет WhatsApp-only в PriceConstructor)
```

Принцип: **вся бизнес-логика в `src/lib/booking/`**, MCP-инструменты и REST-роуты сайта — тонкие обёртки над одними и теми же функциями.

---

## Фаза 0 — Фундамент (блокирует всё остальное)

1. **Service-role клиент Supabase** — `src/lib/supabase/admin.ts` (`createAdminSupabase()` на `SUPABASE_SERVICE_ROLE_KEY`, только server-side, без cookies). Существующий `createServerSupabase()` (`src/lib/supabase/server.ts`) остаётся для админки/SSR.
2. **Миграция `supabase/migrations/007_booking_core.sql`:**
   - `yachts` += `min_hours_weekday int default 2`, `min_hours_weekend int default 4`, `currency text default 'AED'`, `calendar_id text` (Google Calendar ID яхты), `booking_enabled bool default true`.
   - `yacht_pricing` += `valid_from date`, `valid_to date`, `is_weekend bool default false` (сезон по датам; текстовые `season/period` остаются для UI).
   - `extras` (id, slug, name, description, price int, unit `per_booking|per_hour|per_guest`, category, image, active, sort_order) + seed 8 позиций (catering basic/premium, декор ко дню рождения, фотограф 2ч, DJ, jet ski 30 мин, wakeboard, шампанское).
   - `bookings` (id, yacht_id, status `quote|hold|deposit_paid|paid|cancelled|expired`, starts_at, ends_at, hours, guests, customer_name/email/phone, source `mcp|web|admin`, base_amount, extras_amount, bonus_hours, total_amount, deposit_amount, currency, quote_expires_at, hold_expires_at, stripe_checkout_id, stripe_payment_intent_id, gcal_event_id, notes, created_at, updated_at).
   - `booking_extras` (booking_id, extra_id, qty, unit_price, amount).
   - `leads` (для контакт-формы: name, email, phone, inquiry_type, preferred_date, message, source).
   - RLS: `extras` public SELECT; `bookings`, `booking_extras`, `leads` — **только service role** (никакого `USING (true)`, как в analytics).
   - Обновить `src/lib/supabase/types.ts`.
3. **Общая инфраструктура API** — `src/lib/api/`: `rateLimit.ts` (Vercel KV или in-memory с fallback; лимит на IP+tool), `validate.ts` (Zod-парсинг тела с единым `{ error, code }`), `timingSafeEqual` для bearer-секретов (заменить `!==` в `src/app/api/analytics/*`).
4. **`.env.example`** со всеми переменными + новыми: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `GOOGLE_CALENDAR_SERVICE_ACCOUNT_KEY` (можно переиспользовать `GOOGLE_SERVICE_ACCOUNT_KEY` из аналитики, добавив scope calendar), `RESEND_API_KEY`, `BOOKING_ADMIN_EMAIL`, `INDEXNOW_KEY`, `NEXT_PUBLIC_MCP_URL`.
5. **CI workflow** `.github/workflows/ci.yml`: `npm ci`, `lint`, `tsc --noEmit`, `vitest run` на PR. Сейчас CI нет вообще.

## Фаза 1 — Движок бронирования (`src/lib/booking/`)

6. **`pricing-engine.ts`** — перенести и расширить логику из `PriceConstructor.tsx`:
   `calculateQuote({ yacht, startsAt, hours, guests, extras[] }) → { base, bonusHours, extrasBreakdown, total, deposit, currency, appliedSeason, minHoursOk, capacityOk }`.
   Сезон по `valid_from/valid_to`, ставка weekday/weekend, min hours, 4+1 бонус, депозит 50% (константа `DEPOSIT_RATE`), округление. Существующие `getLowestPrice/getHourlyRate` из `src/lib/pricing.ts` остаются для карточек. **Юнит-тесты обязательны** (сейчас pricing не покрыт).
7. **`availability.ts`** — `checkAvailability(yachtSlug, from, to)`: пересечение (а) `bookings` со статусом hold/deposit_paid/paid и не истёкшим `hold_expires_at`, (б) Google Calendar `freebusy.query` по `yachts.calendar_id` (модуль `src/lib/google/calendar.ts` на `googleapis`, service account с доступом к календарям яхт). Буфер между чартерами (константа, 60 мин). Кэш freebusy 60 с.
8. **`quotes.ts`** — `createQuote()` → запись в `bookings` со статусом `quote`, TTL 30 мин, возвращает `quote_id` (uuid) + разбивку. `getBooking(id)`.
9. **`checkout.ts`** — `createCheckout(quote_id, customer)`: повторная проверка availability → статус `hold` (`hold_expires_at = now+30m`) → Stripe Checkout Session (`mode=payment`, line items: депозит 50% одной строкой с описанием «Deposit for {yacht}, {date}, {hours}h + extras», `client_reference_id=booking_id`, `expires_at=hold_expires_at`, `metadata.payment_stage=deposit`, `Idempotency-Key=quote_id`), `success_url=/booking/{id}?status=success`. Возвращает `checkout_url`.
10. **`fulfilment.ts`** — по вебхуку: `deposit_paid` → создать событие в Google Calendar яхты (`events.insert`, название «CHARTER {name} {guests} pax — deposit paid», описание с extras и контактами) → сохранить `gcal_event_id` → email клиенту и менеджеру (Resend; MCP-интеграция Resend уже подключена к аккаунту) + Telegram (переиспользовать `src/lib/analytics/telegram-notifier.ts`, вынести `sendTelegram(text)`). `expired` → статус `expired`, hold снят.
11. **`balance.ts`** (можно в фазу 3) — cron за 72 ч до `starts_at`: второй Checkout на остаток, письмо. При оплате статус `paid`.

## Фаза 2 — API-слой

12. **`src/app/api/stripe/webhook/route.ts`** — верификация подписи (`stripe.webhooks.constructEvent`, raw body), обработка `checkout.session.completed|expired`, идемпотентность по `event.id` (таблица `stripe_events` или колонка на bookings).
13. **`src/app/api/booking/*`** для сайта: `POST quote`, `POST checkout`, `GET availability`, `GET [id]` — тонкие обёртки над `src/lib/booking/*` с Zod и rate limit.
14. **`src/app/api/contact/route.ts`** — принимать `ContactForm`, писать в `leads`, слать email/Telegram. Починить `onSubmit` в `src/components/forms/ContactForm.tsx`.
15. **Страница `/booking/[id]`** — статус брони после Stripe (success/cancel), сводка, что дальше.
16. **`PriceConstructor.tsx`** — добавить дату/гостей/extras, кнопку «Pay deposit» (вызов `/api/booking/checkout`), WhatsApp оставить как альтернативу.

## Фаза 3 — MCP-сервер (`src/app/api/mcp/route.ts`)

17. Зависимости: `mcp-handler@^2`, `@modelcontextprotocol/server@^2`, `stripe`, `googleapis`, `resend`. Роут экспортирует GET/POST, `maxDuration=60`.
18. Инструменты (все с `title`, аннотациями, `inputSchema` Zod, `outputSchema` + `structuredContent` + текстовый дубль). Описания — на английском, с примерами и правилами (валюта AED, Dubai Harbour, депозит 50%, min hours):

| Tool | Аннотации | Что делает |
|---|---|---|
| `list_yachts` | readOnly | Флот: slug, name, builder, length, capacity, cabins, from-price/hr, hero image, url. Фильтры guests, max_price_hour. |
| `get_yacht` | readOnly | Полная карточка + таблица цен по сезонам + included + amenities + rules. |
| `list_destinations` | readOnly | Маршруты/experiences с sailing_time, price_from. |
| `list_extras` | readOnly | Доп. услуги с ценами и unit. |
| `check_availability` | readOnly | Свободные окна для яхты на дату (шаг 1 ч, 08:00–22:00), причины отказа (min hours, занято). |
| `create_quote` | readOnly=false, idempotent | Смета: yacht, date, start, hours, guests, extras[] → quote_id, разбивка, deposit, expires_at. |
| `create_checkout` | destructive=false, idempotent, openWorld | quote_id + name/email/phone → hold + Stripe URL. Возвращает checkout_url и инструкцию показать ссылку пользователю. |
| `get_booking` | readOnly | Статус по booking_id (для «оплатил?»). |

   Ресурсы: `imperial://terms` (условия/отмена из `src/app/terms/page.tsx`, вынести текст в `src/data/terms.ts`), `imperial://company` (контакты, адрес, лицензия из `SITE_CONFIG`). Промпт `plan_charter` (пошаговый сценарий подбора).
19. Безопасность: rate limit per IP (например 60 req/мин read, 10/мин create_*), санитизация всех строк из БД перед отдачей (обрезка, без HTML), ошибки без стека, `create_checkout` требует валидный email (Zod), лимит extras qty, quote TTL. CORS для `/api/mcp` (`Access-Control-Allow-Origin: *`, `Mcp-*` headers).
20. Discovery: `public/.well-known/mcp.json` (не стандарт, но дёшево), страница `/ai` (человеко-читаемая: «Подключи Imperial Yachting к ChatGPT/Claude: URL https://imperialyachting.com/api/mcp», шаги для каждого клиента), упоминание в `llms.txt` и футере. `server.json` для официального MCP registry (namespace `com.imperialyachting`, DNS-verify) — после стабилизации.
21. `robots.txt`: `Disallow: /api/` оставить, но добавить `Allow: /api/mcp` не нужно (не для краулеров); `/ai` и `/.well-known/mcp.json` открыты.
22. Тесты: unit на каждый tool через прямой вызов handler-функций (`src/lib/mcp/tools/*.ts` экспортируют чистые функции, роут только регистрирует), интеграционный smoke через `@modelcontextprotocol/client` против `next dev`.

## Фаза 4 — AI-видимость и SEO

23. **Структурированные данные (`src/components/seo/schemas.ts`)**: `organizationSchema` получить `@id: #organization`; один LocalBusiness (`#localbusiness`, адрес — Dubai Harbour как место оказания услуги, office — в Organization); `yachtProductSchema` → `AggregateOffer` (lowPrice = hourly min, highPrice, offerCount) + отдельные `Offer` per unit (hour/day/week) с `validFrom/validThrough` из новых дат сезонов; `Review` из `src/data/testimonials.ts` рядом с `aggregateRating`; `VideoObject` для YouTube на яхте; `BreadcrumbList`+`ItemList` на `/destinations`, `/services`, `/blog`; `Service` на cinematography/brandwave; `Person` для команды на `/about`. Тесты на все билдеры (сейчас только destination).
24. **`llms.txt` и `llms-full.txt`** — динамические роуты `src/app/llms.txt/route.ts` (Markdown из Supabase: флот с ценами, маршруты, extras, условия, контакты, ссылка на MCP). Кэш 1 ч.
25. **`robots.txt` → `src/app/robots.ts`** (динамика, единый источник): добавить `Claude-SearchBot`, `Claude-User`, `Applebot-Extended`, `meta-externalagent`, `Amazonbot`; оставить Allow для всех answer/search-ботов.
26. **Sitemap**: `lastModified` из `updated_at` яхт/направлений; добавить `/ai`, `/booking` исключить; `generateStaticParams` для `fleet/[slug]` и `destinations/[slug]`.
27. **Верификация и IndexNow**: `metadata.verification` (google, bing — токены от владельца), `src/lib/seo/indexnow.ts` + вызов при сохранении яхты/направления в админке и в ISR-ревалидации; `public/{INDEXNOW_KEY}.txt`.
28. **Контент**: убрать фейковые видео-карточки из `BlogPageClient.tsx` (при пустом фиде — честный пустой стейт); включить реальные статьи в `/blog/[slug]` (MDX или Supabase `posts` таблица, Article schema, canonical, `index: true`); стартовый пакет 6 статей под intent-запросы: «yacht rental Dubai price 2026», «how many hours to book», «Dubai Harbour vs Marina departure», «birthday on a yacht checklist», «what's included / extras», «book a yacht with ChatGPT» (нативная реклама MCP). Уникальный FAQ per yacht (3–4 вопроса из specs) вместо общего `fleetFAQ`.
29. **Локализация (позже)**: RU и AR через `next-intl` с `[locale]` и настоящими hreflang — отдельный этап после запуска, оценка объёма отдельно.

## Фаза 5 — Админка и эксплуатация

30. `/admin/bookings` (список, статус, ссылка на Stripe, ручная отмена/подтверждение), `/admin/extras` (CRUD), поля `min_hours_*`, `calendar_id`, даты сезонов в `src/app/admin/yachts/[id]/page.tsx`.
31. Мониторинг: расширить `src/app/api/health/route.ts` проверками Stripe key, GCal доступа, MCP ping; Telegram-алерт при ошибке вебхука.
32. Cron (Vercel Cron или GH Actions): истечение quotes/holds (safety net к Stripe expired), напоминание об остатке за 72 ч.

---

## Декомпозиция для запуска на младших моделях

Каждый пункт — самостоятельный PR с тестами. Зависимости слева направо.

| # | Задача | Файлы | Зависит от |
|---|---|---|---|
| A1 | Миграция 007 + types.ts + admin client | `supabase/migrations/007_*.sql`, `src/lib/supabase/{admin,types}.ts` | — |
| A2 | `.env.example`, CI workflow, `src/lib/api/{rateLimit,validate}.ts`, timingSafe в analytics | `.github/workflows/ci.yml`, `src/lib/api/*` | — |
| B1 | pricing-engine + тесты | `src/lib/booking/pricing-engine.ts`, `__tests__` | A1 |
| B2 | Google Calendar client + availability + тесты (мок googleapis) | `src/lib/google/calendar.ts`, `src/lib/booking/availability.ts` | A1 |
| B3 | quotes + checkout (Stripe) + тесты (мок stripe) | `src/lib/booking/{quotes,checkout}.ts` | B1, B2 |
| B4 | Stripe webhook + fulfilment (GCal event, email, Telegram) | `src/app/api/stripe/webhook/route.ts`, `src/lib/booking/fulfilment.ts` | B3 |
| C1 | REST `/api/booking/*` + `/api/contact` + leads | `src/app/api/booking/*`, `src/app/api/contact/route.ts`, `ContactForm.tsx` | B3, A2 |
| C2 | Страница `/booking/[id]`, апгрейд PriceConstructor | `src/app/booking/[id]/page.tsx`, `PriceConstructor.tsx` | C1 |
| D1 | MCP роут + read-only tools + resources + тесты | `src/app/api/mcp/route.ts`, `src/lib/mcp/**` | A1, A2 |
| D2 | MCP write tools (quote/checkout/get_booking) | `src/lib/mcp/tools/*` | D1, B3 |
| D3 | `/ai` страница, `.well-known/mcp.json`, `server.json`, доки | `src/app/ai/page.tsx`, `public/.well-known/*` | D2 |
| E1 | Схемы JSON-LD: фиксы @id, AggregateOffer, Review, VideoObject, недостающие Breadcrumb/ItemList + тесты | `src/components/seo/schemas.ts`, страницы | A1 (даты сезонов) |
| E2 | `robots.ts`, `llms.txt`, sitemap lastModified, generateStaticParams, verification | `src/app/{robots,llms.txt,sitemap}.ts`, `layout.tsx` | — |
| E3 | IndexNow + вызовы из админки | `src/lib/seo/indexnow.ts`, admin pages | — |
| E4 | Блог: убрать фейк, реальные статьи (6 шт.), per-yacht FAQ | `src/app/blog/**`, `BlogPageClient.tsx`, `src/data/faq.ts` | — |
| F1 | Админка bookings/extras + поля яхты | `src/app/admin/{bookings,extras}/**`, `admin/yachts/[id]` | A1 |
| F2 | Health-чеки, cron истечения holds и напоминаний | `api/health`, `api/cron/*`, `vercel.json` | B4 |

Параллельные потоки: {A1, A2, E2, E3, E4} → {B1, B2, D1, E1, F1} → {B3, D2} → {B4, C1} → {C2, D3, F2}.

## Что нужно от владельца

- Stripe: secret key (test + live), настроить endpoint вебхука в Dashboard, валюта AED.
- Google Cloud: service account с доступом (writer) к календарям каждой яхты; ID календарей.
- Supabase: `SUPABASE_SERVICE_ROLE_KEY`; выполнить миграцию 007.
- Resend: домен `imperialyachting.com` верифицирован (MCP Resend уже подключён — проверю).
- Google Search Console / Bing Webmaster: verification-токены; IndexNow ключ сгенерируем.
- Реальные цены extras и `min_hours` по яхтам — поправить в админке после сида.

## Верификация

- `npm run lint && npx tsc --noEmit && npm test` зелёные в CI.
- Локально: `next dev`, MCP smoke-скрипт (`scripts/mcp-smoke.ts` через `@modelcontextprotocol/client`): `list_yachts → check_availability → create_quote → create_checkout` возвращает Stripe test URL; оплата тестовой картой → вебхук (Stripe CLI `stripe listen`) → booking `deposit_paid`, событие появляется в Google Calendar, письмо/Telegram приходят.
- Подключить `https://imperialyachting.com/api/mcp` в Claude custom connector и ChatGPT Developer mode, пройти сценарий «хочу яхту на 6 человек в субботу на 4 часа с фотографом».
- Rich Results Test / Schema validator на `/`, `/fleet/[slug]`, `/destinations/[slug]` без ошибок; `curl /llms.txt`, `/robots.txt`, `/sitemap.xml`.
- IndexNow: ответ 200/202 от `api.indexnow.org` при сохранении яхты.
