# MCP-сервер Imperial Yachting

Живой коннектор Model Context Protocol (MCP) для ChatGPT, Claude, Perplexity
и других MCP-клиентов. Человеко-читаемая версия этой страницы — `/ai`
(`src/app/ai/page.tsx`).

## Архитектура

```
AI-клиент (ChatGPT / Claude / Perplexity / MCP-клиент)
   │  Streamable HTTP, без авторизации
   ▼
src/app/api/mcp/route.ts   (mcp-handler, rate limit, CORS)
   │
   ▼
src/lib/mcp/server.ts      (registerImperialServer — регистрирует tools/resources/prompts)
   │
   ▼
src/lib/mcp/tools/*.ts     (чистые функции (input) => { structured, text })
   │
   ▼
src/lib/yachts-db.ts, src/lib/pricing.ts, src/data/*  (данные и прайсинг)
```

Каждый инструмент в `src/lib/mcp/tools/` — это отдельный файл с:
- `*InputSchema` / `*OutputSchema` — Zod-схемы входа/выхода;
- `*Meta` — `{ name, title, description, annotations }`, общий для регистрации в
  `server.ts` и для тестов;
- чистая async-функция `(input) => Promise<{ structured, text }>`, без
  побочных эффектов, которую легко тестировать напрямую (без поднятия HTTP).

`src/app/api/mcp/route.ts` — единственное место, где есть HTTP: rate limiting
по IP (`src/lib/api/rateLimit.ts`), CORS-заголовки и делегирование в
`mcp-handler`. Он не знает о бизнес-логике инструментов.

## Инструменты

| Tool | Тип | Что делает |
|---|---|---|
| `list_yachts` | read-only | Список флота: slug, name, builder, длина, вместимость, цена от, hero-изображение. Фильтры по числу гостей и максимальной ставке/час. |
| `get_yacht` | read-only | Полная карточка яхты: цены по сезонам, что включено, удобства, правила. |
| `list_destinations` | read-only | Маршруты и активности с временем в пути и ценой от. |
| `list_extras` | read-only | Доп. услуги (кейтеринг, декор, фотограф, DJ, джет-ски и т.д.) с ценами. |
| `get_booking_terms` | read-only | Условия бронирования: ставка депозита, минимальные часы чартера, политика отмены. |
| `check_availability`* | read-only | Свободные окна для яхты на дату с учётом реального календаря броней. |
| `create_quote`* | idempotent | Смета (яхта, дата, часы, гости, extras) → `quote_id`, разбивка стоимости, депозит, срок действия. |
| `create_checkout`* | idempotent, open-world | `quote_id` + контакты клиента → hold брони + ссылка на Stripe Checkout. |
| `get_booking`* | read-only | Статус брони по `booking_id`. |
| `list_yachts_for_sale` | read-only | Яхты на продажу (owner-direct): модель, год, размер, статус, цена, ссылка на листинг с материалами. |

Отдельный **приватный** MCP для управления разделом продаж — `/api/mcp/sales`
(только с токеном `SALES_ADMIN_TOKEN`), см. `docs/YACHT_SALES_RU.md`.

\* Booking-инструменты (`check_availability`, `create_quote`,
`create_checkout`, `get_booking`) находятся в разработке (см.
`docs/AI_COMMERCE_PLAN.md`, Фаза 1–2) и ещё не зарегистрированы в
`src/lib/mcp/server.ts`. Они появятся на этом же эндпоинте без необходимости
переподключать коннектор.

Также сервер публикует ресурсы `imperial://terms`, `imperial://company`,
`imperial://faq` и промпт `plan_charter` (см. `src/lib/mcp/resources.ts`,
`src/lib/mcp/prompts.ts`).

## Локальное тестирование

```bash
npm run dev
```

В отдельном терминале — smoke-тест через официальный клиент MCP
(`scripts/mcp-smoke.ts`, не часть автоматического набора vitest):

```bash
npx tsx scripts/mcp-smoke.ts
# или против прод-инстанса:
MCP_URL=https://imperialyachting.com/api/mcp npx tsx scripts/mcp-smoke.ts
```

Быстрый ручной запрос `tools/list` через curl (Streamable HTTP требует оба
заголовка `Accept`):

```bash
curl -s http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Юнит-тесты на сами инструменты — `src/lib/mcp/tools/**/*.test.ts` (или
соответствующая директория `__tests__`), запускаются как обычно:

```bash
npm test
```

## Подключение из ChatGPT / Claude / Perplexity

Пошаговые инструкции для конечного пользователя — на странице `/ai`. Коротко:

- **ChatGPT** — Settings → Connectors (может быть под Advanced/Developer
  mode) → создать коннектор → вставить URL `https://imperialyachting.com/api/mcp`,
  без авторизации.
- **Claude** (claude.ai и Desktop) — Settings → Connectors → Add custom
  connector → указать имя и тот же URL.
- **Perplexity** (Pro/Max) — Settings → Connectors → Add connector →
  транспорт Streamable HTTP → тот же URL.
- **Cursor / произвольный MCP-клиент** — прописать URL в конфиге
  (`mcpServers.<name>.url`), либо обернуть через `mcp-remote` для
  stdio-only клиентов.

Discovery-файл для агентов, которые ищут коннектор автоматически:
`public/.well-known/mcp.json` (не является официальным стандартом, но
дёшево поддерживать).

## Публикация в официальный MCP registry

`server.json` в корне репозитория — манифест для
[registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/)
(схема `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`),
namespace `com.imperialyachting`.

Публикация через официальный CLI `mcp-publisher`:

1. Установить CLI (см. репозиторий `modelcontextprotocol/registry`).
2. Подтвердить владение DNS-неймспейсом `com.imperialyachting`: добавить
   TXT-запись у DNS-провайдера `imperialyachting.com` вида
   `mcp-verify=<challenge-от-registry>` (точный формат и challenge выдаёт
   `mcp-publisher login dns` — команда сама подсказывает, какую запись
   создать).
3. Дождаться распространения TXT-записи (`dig TXT imperialyachting.com`).
4. Запустить `mcp-publisher publish` из корня репозитория — CLI прочитает
   `server.json`, проверит DNS-подтверждение и опубликует версию `0.1.0` в
   registry под именем `com.imperialyachting/booking`.
5. При обновлении инструментов — поднять `version` в `server.json` и
   повторить `mcp-publisher publish`.

Публикация в registry — отдельный шаг после стабилизации API (см.
`docs/AI_COMMERCE_PLAN.md`, п. 20); сам коннектор работает и без неё.

## Безопасность

- **Rate limiting** — на уровне HTTP-роута (`src/app/api/mcp/route.ts`),
  по IP-адресу, до JSON-RPC-парсинга тела запроса, чтобы отбрасывать
  избыточные запросы как можно раньше.
- **Санитизация** — все строки, приходящие из БД (названия яхт, описания,
  и т.д.), проходят через `sanitizeText` (`src/lib/mcp/sanitize.ts`) перед
  отдачей клиенту: обрезка длины, без HTML.
- **Read-only без авторизации** — первый релиз коннектора сознательно не
  требует аутентификации: инструменты только читают публичные данные
  (флот, цены, доступность). Ничего чувствительного не раскрывается.
- **Оплата — только через Stripe Checkout** — платёжные данные никогда не
  проходят через MCP-сервер или чат с ассистентом; `create_checkout`
  (когда появится) лишь возвращает ссылку на хостинговую страницу Stripe.
- **Ошибки без деталей реализации** — сообщения об ошибках инструментов не
  содержат стектрейсов или внутренних деталей БД.
