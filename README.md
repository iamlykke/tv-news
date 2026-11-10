# TV Slides

Слайды для офисных телевизоров. В админке загружаешь картинки и mp4, а телевизор с открытым `/tv/<экран>` крутит их по кругу. Слайды с днями рождения и годовщинами собираются автоматически из раздела «Люди».

**Стек:** Next.js 16 (App Router) · Prisma 7 · Supabase (Postgres + Storage) · NextAuth (Google) · Tailwind 4 + daisyUI · деплой на Vercel.

## Как это работает

- **Экраны** (`US`, `UK`, `RS`, `DE` создаются миграцией) — у каждого свой адрес `/tv/<slug>` и часовой пояс. По часовому поясу определяется «сегодня» для праздников.
- **Слайды** — файл в Supabase Storage + расписание. «Показывать с» / «Снять после» проверяются прямо в запросе, поэтому крон не нужен.
- **Люди** — имя, фото, дата рождения, дата начала работы, экран (или «все экраны»). В их день на экране появляются слайды Happy Birthday и «N years with …».
- **Доступ** — вход через Google, пускаем только почты из раздела «Администраторы». `Admin` управляет слайдами и людьми, `Full Admin` вдобавок экранами и администраторами.
- **Телевизор** раз в 5 минут и на последнем слайде перезапрашивает данные. Раз в 10 минут он сверяет версию деплоя и сам перезагружается после релиза.

Файлы загружаются из браузера прямо в Supabase по подписанной ссылке и не проходят через serverless-функцию: у Vercel лимит тела запроса около 4.5 МБ, а видео тяжелее.

## Настройка

### 1. Supabase

1. Создай проект на [supabase.com](https://supabase.com).
2. **Storage → New bucket** с именем `slides`, отметь **Public bucket**. Лимит размера файла поставь с запасом под видео (например, 50 MB).
3. **Project Settings → Database → Connection string**:
   - *Transaction pooler* (порт 6543) → `DATABASE_URL`, в конец добавь `?pgbouncer=true`;
   - *Session pooler* (порт 5432) → `DIRECT_URL` (для миграций).
4. **Project Settings → API**: `URL` → `NEXT_PUBLIC_SUPABASE_URL`, `anon`/publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `service_role`/secret key → `SUPABASE_SERVICE_ROLE_KEY`.

Миграция включает RLS на всех таблицах. Anon-ключ виден браузеру, поэтому таблицы через Supabase REST для него закрыты. Prisma ходит под ролью `postgres`, и RLS её не касается.

### 2. Google OAuth

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Create credentials → OAuth client ID → Web application**:

- Authorized JavaScript origins: `http://localhost:3000`, `https://<твой-домен>`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`, `https://<твой-домен>/api/auth/callback/google`

Client ID и secret кладутся в `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`.

### 3. Локальный запуск

```bash
cp .env.example .env    # заполнить значения
npm install             # заодно сгенерирует Prisma Client
npm run db:deploy       # применить миграции к базе
npm run dev
```

В `ADMIN_EMAILS` впиши свою почту: при первом входе она станет Full Admin. Остальных добавляй через «Администраторы».

### 4. Деплой на Vercel

1. Импортируй репозиторий в Vercel.
2. Перенеси все переменные из `.env.example` в **Settings → Environment Variables**. `NEXTAUTH_URL` = `https://<твой-домен>`.
3. Vercel запустит `vercel-build`: сначала `prisma migrate deploy`, потом `next build`.

На телевизоре открой `https://<твой-домен>/tv/rs` (или другой slug) в полноэкранном режиме. Стрелки на пульте или клавиатуре листают слайды.

## Скрипты

| Команда | Что делает |
| --- | --- |
| `npm run dev` | dev-сервер |
| `npm run build` | прод-сборка |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | новая миграция после правки `schema.prisma` (dev) |
| `npm run db:deploy` | применить миграции |
| `npm run db:studio` | Prisma Studio |

## Структура

```
prisma/                  схема и миграции
src/app/admin/...        админка
src/app/tv/[slug]        страница для телевизора
src/app/api/tv/[slug]    публичный API экрана
src/app/api/admin/...    API админки (за авторизацией)
src/components/slides/   слайды ДР и годовщин (холст 1920×1080)
src/lib/dal/             доступ к данным + проверки прав
src/lib/storage.ts       Supabase Storage (сервер)
src/lib/upload-client.ts загрузка файлов из браузера
src/proxy.ts             редирект на /login для /admin
```
