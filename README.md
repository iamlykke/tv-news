# TV Slides

Slides for office TVs. Upload images and mp4 videos in the admin panel, and a TV with `/tv/<screen>` open plays them on a loop. Birthday and anniversary slides are generated automatically from the People section.

**Stack:** Next.js 16 (App Router) · Prisma 7 · Supabase (Postgres + Storage) · NextAuth (Google) · Tailwind 4 + daisyUI · deployed on Vercel.

## How it works

- **Screens** (`US`, `UK`, `RS`, `DE` are created by the initial migration). Each has its own URL `/tv/<slug>` and a timezone, which decides what "today" means for celebrations.
- **Slides**: a file in Supabase Storage plus a schedule. "Show from" / "Take down after" are checked at query time, so no cron is needed.
- **People**: name, photo, date of birth, start date, and a screen (or "All screens"). On their day the screen shows a Happy Birthday slide or an "N years with …" slide.
- **Access**: Google sign-in, limited to the emails listed under Admins. `Admin` manages slides and people; `Full Admin` also manages screens and admins.
- **The TV** refetches its data every 5 minutes and on the last slide. Every 10 minutes it checks the deployment version and reloads itself after a release.

Files are uploaded from the browser straight to Supabase via a signed URL, bypassing the serverless function. Vercel caps request bodies at about 4.5 MB, which is too small for video.

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Storage → New bucket** named `slides`, with **Public bucket** checked. Set a generous file size limit for videos (e.g. 50 MB).
3. **Project Settings → Database → Connection string**:
   - *Transaction pooler* (port 6543) → `DATABASE_URL`, with `?pgbouncer=true` appended;
   - *Session pooler* (port 5432) → `DIRECT_URL` (used for migrations).
4. **Project Settings → API**: `URL` → `NEXT_PUBLIC_SUPABASE_URL`, `anon`/publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `service_role`/secret key → `SUPABASE_SERVICE_ROLE_KEY`.

The migration enables RLS on every table. The anon key is visible to the browser, so it cannot read or write the tables through the Supabase REST API. Prisma connects as the `postgres` role, which bypasses RLS.

### 2. Google OAuth

[Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Create credentials → OAuth client ID → Web application**:

- Authorized JavaScript origins: `http://localhost:3000`, `https://<your-domain>`
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`, `https://<your-domain>/api/auth/callback/google`

Put the client ID and secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 3. Run locally

```bash
cp .env.example .env    # fill in the values
npm install             # also generates the Prisma Client
npm run db:deploy       # apply migrations to the database
npm run dev
```

Put your email in `ADMIN_EMAILS`: it becomes a Full Admin on first sign-in. Add everyone else under Admins.

### 4. Deploy to Vercel

1. Import the repository into Vercel.
2. Copy every variable from `.env.example` into **Settings → Environment Variables**. Set `NEXTAUTH_URL` to `https://<your-domain>`.
3. Vercel runs `vercel-build`: first `prisma migrate deploy`, then `next build`.

On the TV, open `https://<your-domain>/tv/rs` (or another slug) in full-screen mode. The arrow keys on the remote or keyboard flip through the slides.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server |
| `npm run build` | production build |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:migrate` | create a migration after editing `schema.prisma` (dev) |
| `npm run db:deploy` | apply migrations |
| `npm run db:studio` | Prisma Studio |

## Structure

```
prisma/                  schema and migrations
src/app/admin/...        admin panel
src/app/tv/[slug]        TV page
src/app/api/tv/[slug]    public screen API
src/app/api/admin/...    admin API (behind auth)
src/components/slides/   birthday and anniversary slides (1920×1080 canvas)
src/lib/dal/             data access + permission checks
src/lib/storage.ts       Supabase Storage (server)
src/lib/upload-client.ts browser file uploads
src/proxy.ts             redirects /admin to /login when signed out
```
