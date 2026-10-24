# Раздел «Docs» (`/documents`) — вход по ссылке на почту

Страница `https://imperialyachting.com/documents` (в меню и подвале — **Docs**,
короткий адрес `imperialyachting.com/docs`) открыта для всех и индексируется
поисковиками: каталог документов, регистрационные данные компании.

**Скачать PDF и увидеть банковские реквизиты** можно только после входа по почте:

1. Посетитель вводит email (имя и компания — по желанию) и нажимает
   «Email me a sign-in link».
2. На почту приходит письмо с кнопкой **Open documents** (ссылка действует 24 часа).
3. По клику доступ открывается на этом устройстве на 30 дней.

Пароля больше нет. Так мы знаем, кто именно смотрел и скачивал документы.

---

## 1. Где смотреть, кто заходил

- **Админка → Docs** (`/admin/documents`): все, кто запрашивал доступ —
  email, имя, компания, когда подтвердил почту, сколько раз входил и скачивал,
  страна, статус передачи в PMS.
- **Telegram и письмо на `BOOKING_ADMIN_EMAIL`** — при каждом входе по ссылке
  («first sign-in» для новых). На письмо можно сразу ответить человеку.
- В Supabase: таблицы `document_contacts` (один контакт на email) и
  `document_access_events` (журнал: запрос ссылки, вход, скачивание какого документа).

## 2. Что нужно для работы

1. **Запустить миграцию** `supabase/migrations/013_document_access.sql`
   (Supabase → SQL Editor → вставить → Run). Без неё вход работает, но почты
   не сохраняются.
2. **Resend** (`RESEND_API_KEY`, `BOOKING_FROM_EMAIL`) — уже используется для
   писем о бронированиях. Без него письма со ссылкой не отправятся, и форма
   покажет «Email sign-in is temporarily unavailable».
3. Опционально `DOCUMENTS_SESSION_SECRET` — ключ подписи ссылок и сессий. Если
   не задан, берётся производный от `SUPABASE_SERVICE_ROLE_KEY`. Смена ключа
   разлогинивает всех.

Переменная `DOCUMENTS_PASSWORD` больше не нужна — её можно удалить в Vercel.

## 3. Передача почт в PMS

Каждый подтверждённый контакт помечается `pms_sync_status = pending` и ждёт
передачи в PMS. Как только будет решено, куда передавать, достаточно задать в
Vercel `PMS_CONTACTS_WEBHOOK_URL` (и при необходимости `PMS_CONTACTS_WEBHOOK_TOKEN`) —
сайт начнёт отправлять контакты сам. Подробное ТЗ для команды, вопросы к
владельцу и формат данных: [`docs/tasks/DOCS_EMAIL_TO_PMS_RU.md`](docs/tasks/DOCS_EMAIL_TO_PMS_RU.md).

## 4. Как добавить или заменить PDF

Файлы лежат **не** в `/public`, а в `private/documents/` — по прямой ссылке их
не открыть без входа.

| Документ                     | Имя файла                            |
| ---------------------------- | ------------------------------------ |
| Company Card                 | `company-card.pdf`                   |
| Trade License                | `trade-license.pdf`                  |
| EJARI Tenancy Contract       | `ejari.pdf`                          |
| Certificate of Incorporation | `certificate-of-incorporation.pdf`   |
| Establishment Card           | `establishment-card.pdf`             |
| Memorandum of Association    | `memorandum-of-association.pdf`      |

Как только файл появляется в папке, у документа загорается кнопка скачивания.
Пока файла нет — «Available on request». Закоммитьте файл и задеплойте.

Названия, описания и список документов — в `src/lib/documents.ts`.

## 5. Как это устроено (для разработчиков)

- `/documents` — серверная страница, публичная. Сессия (cookie
  `imperial_docs_session`) решает, показывать ли кнопки Download и реквизиты.
- `POST /api/documents/request-link` — сохраняет email, шлёт письмо со ссылкой
  (лимиты: 5 запросов в минуту с IP, 3 письма за 10 минут на один адрес).
- `GET /api/documents/verify?token=…` — проверяет ссылку, ставит cookie,
  записывает вход, после редиректа шлёт уведомление и передаёт контакт в PMS.
- `GET /api/documents/file/[slug]` — отдаёт PDF только с валидной сессией и
  пишет скачивание в журнал.
- `POST /api/documents/lock` — выход (кнопка **Sign out**).
- Ссылки и сессии — подписанные HMAC-токены с email и сроком (`src/lib/documents-auth.ts`);
  токен из письма нельзя использовать как cookie и наоборот.
