# Ежедневный анализ рекламы Meta (Facebook / Instagram)

Meta выпустила собственный **MCP-сервер для рекламы** — `https://mcp.facebook.com/ads`.
Это даёт Claude прямой доступ к рекламному кабинету: не только к цифрам, но и к
внутренним сигналам Meta, которых нет в обычном Marketing API — оценка
возможностей (opportunity score), детектор аномалий, бенчмарки по отрасли и по
аукциону.

В проекте настроено два контура:

| Контур | Что делает | Когда работает |
|---|---|---|
| **Автоматический** | Каждый день собирает данные, анализирует, пишет отчёт в базу и присылает сводку в Telegram | 06:00 UTC (10:00 по Дубаю), GitHub Actions |
| **Интерактивный** | Вы разговариваете с Claude Code, он ходит в кабинет через MCP и вносит правки | Когда вы этого захотите |

---

## 1. Что нужно получить в Meta

### 1.1. Приложение и разрешения

1. Создайте (или возьмите существующее) приложение на
   [developers.facebook.com/apps](https://developers.facebook.com/apps).
2. **Use cases → Add use cases → «Create & manage ads with ads MCP server»**.
3. Запомните **App ID** — он понадобится для OAuth.

Нужные разрешения (scopes):

```
ads_mcp_management, ads_read, ads_management,
catalog_management, business_management,
pages_show_list, instagram_basic
```

> Если вы управляете рекламой других компаний (агентская схема), для
> `ads_mcp_management` потребуется App Review и Advanced Access. Для своего
> собственного кабинета — не требуется.

### 1.2. Токен доступа

Для **автоматического** контура нужен токен, который живёт долго и не требует
входа руками. Получите User Access Token в
[Graph API Explorer](https://developers.facebook.com/tools/explorer/) с
перечисленными выше scopes и обменяйте его на долгоживущий.

MCP-сервер Meta принимает его как обычный bearer-токен — отдельного OAuth на
каждый запуск не нужно.

### 1.3. ID рекламного кабинета

В Ads Manager это номер вида `act_1234567890`.

---

## 2. Переменные окружения

Добавьте в **Vercel → Project → Settings → Environment Variables**:

```
META_ADS_ACCESS_TOKEN = <долгоживущий токен из п. 1.2>
META_ADS_ACCOUNT_ID   = act_1234567890
META_ADS_CURRENCY     = USD          # или AED — валюта кабинета
```

Уже должны быть заданы (используются недельной аналитикой):

```
ANTHROPIC_API_KEY
ANALYTICS_CRON_SECRET
GOOGLE_SERVICE_ACCOUNT_KEY
GOOGLE_ANALYTICS_PROPERTY_ID
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
```

В **GitHub → Settings → Secrets and variables → Actions** должны быть
`SITE_URL` и `ANALYTICS_CRON_SECRET` (они уже есть для недельного отчёта).

---

## 3. Миграция базы

Выполните в Supabase SQL Editor файл:

```
supabase/migrations/20260910_ads_tables.sql
```

Он создаёт две таблицы: `ads_reports` (ежедневный отчёт) и
`ads_recommendations` (что предлагается сделать).

---

## 4. Как работает автоматический отчёт

`.github/workflows/ads-daily.yml` каждый день дёргает `/api/ads/collect`. Дальше:

1. Из GA4 берутся **сигналы с сайта** по трафику из Meta: сессии, клики в
   WhatsApp, отправленные заявки, есть ли UTM-метки.
2. Claude (модель Opus 5) через MCP-сервер Meta вызывает инструменты:
   `ads_get_ad_entities`, `ads_insights_performance_trend`,
   `ads_insights_anomaly_signal`, `ads_get_opportunity_score`,
   `ads_insights_auction_ranking_benchmarks`, `ads_insights_industry_benchmark`.
3. Результат складывается в Supabase и приходит в Telegram: расход, CTR, CPC,
   цена результата, аномалии, вердикт по каждому объявлению и 2–5 конкретных
   действий.

Анализируется **вчерашний** день: Meta досчитывает атрибуцию ещё несколько часов
после полуночи, поэтому «сегодня» — всегда неполная картина.

Запустить вручную: **GitHub → Actions → Daily Ads Report → Run workflow**.

---

## 5. Интерактивная работа (самое полезное)

В корне лежит `.mcp.json` — Claude Code подхватит сервер `meta-ads` сам.
Задайте переменную окружения с App ID из п. 1.1:

```bash
export META_APP_ID=<ваш App ID>
```

Если вход через Facebook не проходит (Claude Code не подставил переменную —
видно по ошибке про неизвестный `client_id`), пропишите App ID напрямую в
локальный конфиг:

```bash
claude mcp add --transport http --client-id <ваш App ID> meta-ads https://mcp.facebook.com/ads
```

При первом запуске Claude Code спросит подтверждение на подключение
MCP-сервера из `.mcp.json` — это нормально, согласитесь.

При первом обращении Claude откроет вход через Facebook Business — дальше токен
обновляется сам.

Затем просто просите:

> «Посмотри рекламу за неделю, что масштабировать, что выключить»

Сработает скилл `.claude/skills/ads-optimize/SKILL.md`: он знает контекст
бизнеса (высокий чек, низкий объём, конверсия уходит в WhatsApp, сезонность
Дубая) и правила принятия решений.

**Важно — предохранители в скилле:**

- Claude **не меняет** бюджеты, статусы, таргетинг и креативы без вашего
  явного согласия в диалоге — сначала показывает предложение.
- Не выключает объявление по данным одного дня.
- Бюджеты двигает шагами ±20–30%, а не удваивает.

---

## 6. Чего Meta не видит

Главное ограничение: **настоящая заявка приходит в WhatsApp**, а Meta об этом не
знает. Поэтому в отчёте всегда есть блок «On the site» из GA4 — сессии из Meta,
клики в WhatsApp, заявки.

Отсюда самое важное разовое действие: **проставить UTM-метки на все ссылки в
объявлениях**:

```
utm_source=facebook
utm_medium=paid_social
utm_campaign={{campaign.name}}
utm_content={{ad.name}}
```

Без них видно только «из Meta пришло N сессий», но не видно, **какое именно
объявление** принесло заявку. Пока меток нет, отчёт будет каждый день помечать
это как проблему высокого приоритета — и это честно: без атрибуции всё
остальное разбирательство держится на догадках.
