# Enns Site Remake

Next.js 16 app for a real-estate marketing site with Supabase-backed listings and admin CRUD routes.

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Supabase (Postgres + Storage)
- ESLint + Prettier
- Husky + lint-staged (pre-commit checks)

## Local setup

1. Install dependencies:

```bash
npm ci
```

1. Create local env file:

```bash
cp .env.example .env.local
```

1. Fill required env vars in `.env.local`:

- `STORAGE_SUPABASE_URL`
- `STORAGE_SUPABASE_PUBLISHABLE_KEY` (or `STORAGE_SUPABASE_ANON_KEY`)
- `STORAGE_SUPABASE_SECRET_KEY` (or `STORAGE_SUPABASE_SERVICE_ROLE_KEY`)

Optional:

- `STORAGE_SUPABASE_LISTINGS_BUCKET` (default: `listing-images`)
- `ADMIN_UI_BYPASS_AUTH=true` for local/testing-only admin bypass
- `ADMIN_API_TOKEN` for static token mode

1. Run dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Listings features

- Public listing APIs:
  - `GET /api/listings`
  - `GET /api/listings/sold`
  - `GET /api/listings/[id]`
- Admin listing APIs:
  - `POST /api/admin/listings`
  - `PUT /api/admin/listings/[id]`
  - `PATCH /api/admin/listings/[id]`
  - `DELETE /api/admin/listings/[id]`
  - `POST /api/admin/listings/upload` (image upload to Supabase Storage)
- Admin UI:
  - `/admin/listings`
- Public listings page:
  - `/listings`

## Supabase setup

- Run schema SQL:
  - `supabase/listings-schema.sql`
- Ensure Storage bucket exists (default `listing-images`).
- Add RLS policy to allow public read for active/sold listings.

## Quality checks

```bash
npm run format:check
npm run lint
npm run build
```

Auto-fix helpers:

```bash
npm run format
npm run lint:fix
```

## Deploying to Vercel

- `.env.local` is not deployed automatically.
- Add the same env vars in Vercel Project Settings -> Environment Variables.
- Redeploy after changing env values.
