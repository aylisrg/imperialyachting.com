# Analytics Improvement System — Архитектура

## Контекст

**Сайт**: imperialyachting.com — Next.js 16, React 19, Supabase, Vercel, Tailwind
**GA**: G-BQPZ2WJWWL (gtag.js), сейчас только базовые page views
**Точки конверсии**: WhatsApp, Contact form, Phone, Email, Fleet page → yacht detail
**Админка**: `/admin` — управление флотом яхт

---

## 1. Обзор системы

```
┌─────────────┐    ┌──────────────────┐    ┌───────────────┐    ┌──────────────┐
│  Google      │    │  API Route       │    │  Claude API   │    │  Supabase    │
│  Analytics   │───▶│  /api/analytics  │───▶│  (Анализ)     │───▶│  (Хранение)  │
│  Data API    │    │  collect + analyze│    │               │    │              │
└─────────────┘    └──────────────────┘    └───────────────┘    └──────────────┘
                          │                                            │
                   ┌──────┴──────┐                              ┌──────┴──────┐
                   │  Триггеры:  │                              │  Вывод:     │
                   │  • Cron GH  │                              │  • /admin/  │
                   │    Actions  │                              │    analytics│
                   │  • Кнопка   │                              │  • Telegram │
                   │    в админке│                              │    бот      │
                   └─────────────┘                              └─────────────┘
```

---

## 2. Фаза 1 — Enhanced GA Event Tracking (фронтенд)

Сейчас GA собирает только page views. Для качественной аналитики нужно трекать конверсионные действия.

### Новый модуль: `src/lib/analytics.ts`

```ts
// Типизированная обёртка над gtag для отслеживания конверсий
export function trackEvent(action: string, params: Record<string, string>) { ... }
```

**Какие события начнём трекать:**

| Событие | Где срабатывает | GA Event Name |
|---------|----------------|---------------|
| Клик WhatsApp | Hero, CTA, Fleet, Header | `click_whatsapp` |
| Клик "Contact Us" | Hero, CTA | `click_contact` |
| Клик на яхту | Fleet page, FleetPreview | `click_yacht` |
| Отправка формы | Contact page | `submit_inquiry` |
| Клик телефон | CTA, Footer, Header | `click_phone` |
| Клик email | CTA, Footer | `click_email` |
| Скролл до CTA секции | Главная страница | `view_cta_section` |
| Клик "Explore Fleet" | Hero | `click_explore_fleet` |
| Клик на destination | Destinations page | `click_destination` |
| Promo popup interaction | PromoPopup | `promo_popup_interact` |

**Затронутые компоненты** (добавляем `onClick` → `trackEvent`):
- `src/components/ui/Button.tsx` — базовый трекинг для CTA-кнопок
- `src/components/sections/Hero.tsx`
- `src/components/sections/CTASection.tsx`
- `src/components/gallery/FleetCard.tsx`
- `src/components/forms/ContactForm.tsx`
- `src/components/promo/PromoPopup.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`

---

## 3. Фаза 2 — Бэкенд: Сбор данных из GA

### 3.1 Google Analytics Data API (GA4)

Будем использовать **Google Analytics Data API v1** (серверный) для программного извлечения данных.

**Необходимые credentials:**
- Google Cloud Service Account с доступом к GA property
- Env-переменные: `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON)

**NPM-пакет**: `@google-analytics/data` (официальный клиент)

### 3.2 API Route: `src/app/api/analytics/collect/route.ts`

Собирает данные за последние 7 дней:

```ts
// Какие метрики запрашиваем у GA Data API:
const metrics = [
  'sessions',           // Общее число сессий
  'totalUsers',         // Уникальные пользователи
  'newUsers',           // Новые пользователи
  'bounceRate',         // Bounce rate
  'averageSessionDuration', // Средняя длительность сессии
  'screenPageViews',    // Просмотры страниц
  'conversions',        // Конверсии (настроенные в GA)
  'eventCount',         // Количество событий
];

const dimensions = [
  'pagePath',           // По каким страницам
  'deviceCategory',     // Desktop / Mobile / Tablet
  'sessionSource',      // Источник трафика
  'sessionMedium',      // Канал трафика
  'country',            // География
  'eventName',          // Какие события (наши кастомные)
];
```

**Результат**: JSON-объект с полным срезом аналитики за неделю.

### 3.3 Защита эндпоинта

- Проверка `Authorization: Bearer <ANALYTICS_CRON_SECRET>` header
- Секрет хранится в env, передаётся из GitHub Actions и из админки

---

## 4. Фаза 3 — AI-анализ через Claude API

### 4.1 API Route: `src/app/api/analytics/analyze/route.ts`

Получает собранные данные → отправляет в Claude API с детальным промптом.

**System prompt для Claude** (суть):

```
Ты — CRO-аналитик для сайта аренды яхт в Дубае (imperialyachting.com).
Проанализируй еженедельные данные Google Analytics и предоставь:

1. SUMMARY: Краткая сводка за неделю (3-5 предложений)
2. KEY_METRICS: Ключевые метрики с трендом ↑↓ vs прошлая неделя
3. HYPOTHESES: 3-5 гипотез для увеличения конверсии с приоритетом (high/medium/low)
   - Каждая гипотеза: проблема → предлагаемое решение → ожидаемый эффект
4. QUICK_WINS: 1-3 быстрых действия, которые можно реализовать за день
5. PAGE_INSIGHTS: Анализ по ключевым страницам (landing, fleet, contact)
6. TRAFFIC_ANALYSIS: Откуда идёт трафик, какие каналы работают лучше

Формат ответа — структурированный JSON.
```

**ENV**: `ANTHROPIC_API_KEY`
**NPM-пакет**: `@anthropic-ai/sdk`

### 4.2 Структура ответа Claude (типизирован)

```ts
interface AnalyticsReport {
  id: string;
  period_start: string;          // "2026-02-17"
  period_end: string;            // "2026-02-24"

  // Сырые метрики
  raw_metrics: {
    sessions: number;
    users: number;
    new_users: number;
    bounce_rate: number;
    avg_session_duration: number;
    page_views: number;
    whatsapp_clicks: number;
    contact_clicks: number;
    inquiry_submissions: number;
    yacht_clicks: number;
    phone_clicks: number;
  };

  // Сравнение с прошлой неделей
  trends: Record<string, { value: number; change_percent: number; direction: 'up' | 'down' | 'flat' }>;

  // AI-генерированный анализ
  summary: string;
  hypotheses: Array<{
    id: string;
    title: string;
    problem: string;
    solution: string;
    expected_impact: string;
    priority: 'high' | 'medium' | 'low';
    category: 'ux' | 'content' | 'technical' | 'marketing';
    status: 'new' | 'accepted' | 'rejected' | 'implemented' | 'tested';
  }>;
  quick_wins: Array<{ title: string; description: string; effort: 'low' | 'medium' }>;
  page_insights: Array<{ page: string; views: number; bounce_rate: number; insight: string }>;
  traffic_analysis: { summary: string; top_sources: Array<{ source: string; sessions: number; conversion_rate: number }> };

  created_at: string;
  status: 'collecting' | 'analyzing' | 'complete' | 'error';
}
```

---

## 5. Фаза 4 — Supabase: Хранение

### Новые таблицы

```sql
-- Еженедельные отчёты
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  raw_metrics JSONB NOT NULL,           -- Сырые данные из GA
  trends JSONB,                          -- Сравнение с прошлой неделей
  summary TEXT,                          -- AI-сводка
  page_insights JSONB,                   -- Анализ по страницам
  traffic_analysis JSONB,                -- Анализ трафика
  quick_wins JSONB,                      -- Быстрые действия
  status TEXT DEFAULT 'collecting',      -- collecting → analyzing → complete → error
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Гипотезы/рекомендации (отдельная таблица — можно менять статус)
CREATE TABLE analytics_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES analytics_reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  expected_impact TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT CHECK (category IN ('ux', 'content', 'technical', 'marketing')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'rejected', 'implemented', 'tested')),
  notes TEXT,                            -- Заметки администратора
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. Фаза 5 — Триггеры запуска

### 6.1 GitHub Actions (еженедельный cron)

**Файл**: `.github/workflows/analytics-weekly.yml`

```yaml
name: Weekly Analytics Report
on:
  schedule:
    - cron: '0 8 * * 1'   # Каждый понедельник в 8:00 UTC (12:00 Dubai)
  workflow_dispatch:        # Ручной запуск из GitHub UI

jobs:
  collect-and-analyze:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger analytics collection
        run: |
          curl -X POST https://imperialyachting.com/api/analytics/collect \
            -H "Authorization: Bearer ${{ secrets.ANALYTICS_CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

### 6.2 Кнопка в админке

На странице `/admin/analytics` — кнопка "Generate Report Now" для ручного запуска.

---

## 7. Фаза 6 — UI: Админ-панель аналитики

### Новая страница: `/admin/analytics`

**Структура:**

```
/admin/analytics
├── Dashboard (текущий отчёт)
│   ├── Ключевые метрики (карточки с трендами ↑↓)
│   ├── AI-сводка за неделю
│   ├── Топ-страницы
│   └── Источники трафика
├── Гипотезы
│   ├── Список с фильтрами по статусу/приоритету
│   ├── Возможность менять статус (new → accepted → implemented → tested)
│   └── Добавление заметок
├── История отчётов
│   └── Список прошлых недель с возможностью просмотра
└── Кнопка "Generate Report Now"
```

**Компоненты:**
- `src/app/admin/analytics/page.tsx` — основная страница
- `src/app/admin/analytics/components/MetricsCards.tsx` — карточки KPI
- `src/app/admin/analytics/components/HypothesesList.tsx` — список гипотез
- `src/app/admin/analytics/components/ReportHistory.tsx` — история
- `src/app/admin/analytics/components/TrafficChart.tsx` — визуализация трафика

**Навигация**: Добавить ссылку "Analytics" в AdminHeader.

---

## 8. Фаза 7 — Telegram-уведомления

### API Route: `src/app/api/analytics/notify/route.ts`

После генерации отчёта отправляет краткую сводку в Telegram.

**ENV**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

**Формат сообщения:**
```
📊 Еженедельный отчёт Imperial Yachting
Период: 17 Feb – 24 Feb 2026

📈 Ключевые метрики:
• Sessions: 1,234 (+12% ↑)
• Bounce Rate: 45% (-3% ↓)
• WhatsApp clicks: 89 (+25% ↑)
• Contact form: 12 (+8% ↑)

💡 Топ-3 гипотезы:
1. [HIGH] Добавить sticky CTA на мобильных — bounce rate на mobile на 20% выше
2. [MED] A/B тест заголовка Hero секции — CTR на "Explore Fleet" < 3%
3. [MED] Оптимизировать fleet страницу — высокий exit rate

🔗 Полный отчёт: imperialyachting.com/admin/analytics
```

---

## 9. Файловая структура (новые файлы)

```
src/
├── lib/
│   ├── analytics.ts                          # trackEvent helper (фронтенд)
│   └── analytics/
│       ├── ga-client.ts                      # Google Analytics Data API клиент
│       ├── claude-analyzer.ts                # Claude API анализатор
│       ├── telegram-notifier.ts              # Telegram бот
│       └── types.ts                          # Типы для отчётов и гипотез
├── app/
│   ├── api/analytics/
│   │   ├── collect/route.ts                  # Сбор данных из GA
│   │   ├── analyze/route.ts                  # AI-анализ (вызывается после collect)
│   │   ├── notify/route.ts                   # Telegram уведомление
│   │   ├── reports/route.ts                  # GET — список отчётов
│   │   └── hypotheses/[id]/route.ts          # PATCH — обновление статуса гипотезы
│   └── admin/analytics/
│       ├── page.tsx                           # Дашборд аналитики
│       └── components/
│           ├── MetricsCards.tsx
│           ├── HypothesesList.tsx
│           ├── ReportHistory.tsx
│           └── TrafficChart.tsx
.github/
└── workflows/
    └── analytics-weekly.yml                   # Cron job
```

---

## 10. Env-переменные (новые)

```env
# Google Analytics Data API
GOOGLE_ANALYTICS_PROPERTY_ID=        # GA4 property ID (числовой)
GOOGLE_SERVICE_ACCOUNT_KEY=          # JSON key от Service Account (base64)

# Claude API
ANTHROPIC_API_KEY=                   # Ключ Anthropic API

# Cron security
ANALYTICS_CRON_SECRET=               # Секрет для авторизации cron-запросов

# Telegram notifications
TELEGRAM_BOT_TOKEN=                  # Токен Telegram бота
TELEGRAM_CHAT_ID=                    # ID чата для уведомлений
```

---

## 11. NPM-зависимости (новые)

```
@google-analytics/data   — Клиент GA Data API v1
@anthropic-ai/sdk        — Клиент Claude API
```

---

## 12. Порядок реализации

| Шаг | Что делаем | Зависимости |
|-----|-----------|-------------|
| 1 | `src/lib/analytics.ts` — event tracking helper | — |
| 2 | Добавляем trackEvent в компоненты (Button, Hero, CTA, FleetCard, etc.) | Шаг 1 |
| 3 | SQL миграция — создаём таблицы в Supabase + обновляем types.ts | — |
| 4 | `src/lib/analytics/types.ts` — типы | — |
| 5 | `src/lib/analytics/ga-client.ts` — клиент GA Data API | — |
| 6 | `src/lib/analytics/claude-analyzer.ts` — AI анализ | — |
| 7 | `src/app/api/analytics/collect/route.ts` — эндпоинт сбора | Шаги 4-6 |
| 8 | `src/app/api/analytics/reports/route.ts` — API для чтения | Шаг 3 |
| 9 | `src/app/api/analytics/hypotheses/[id]/route.ts` — PATCH статуса | Шаг 3 |
| 10 | `/admin/analytics` — UI дашборд | Шаги 7-9 |
| 11 | `src/lib/analytics/telegram-notifier.ts` — Telegram бот | — |
| 12 | `src/app/api/analytics/notify/route.ts` — эндпоинт нотификации | Шаг 11 |
| 13 | `.github/workflows/analytics-weekly.yml` — cron job | Шаг 7 |
| 14 | Тесты | Все шаги |

---

## 13. Что нужно от тебя (owner)

1. **Google Cloud**: создать Service Account, дать ему Viewer доступ к GA4 property, скачать JSON key
2. **Anthropic**: получить API key
3. **Telegram**: создать бота через @BotFather, получить token + chat_id
4. **Supabase**: выполнить SQL миграцию (я подготовлю скрипт)
5. **Vercel**: добавить env-переменные
6. **GitHub**: добавить secrets для Actions (`ANALYTICS_CRON_SECRET`)
