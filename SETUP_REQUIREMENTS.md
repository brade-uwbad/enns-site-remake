# Setup Requirements

Project: `enns-site-remake`  
Runtime: Node.js

## System Requirements

- Node.js >= 20
- npm >= 10

## First-Time Setup

1. `npm ci`
2. Copy `.env.example` to `.env.local`
3. Fill required env vars

## Run Locally

- `npm run dev`

## Quality Checks

- `npm run format:check`
- `npm run lint`
- `npm run build`

## Formatting and Linting

- `npm run format`
- `npm run lint:fix`

## Git Hooks

- Husky and lint-staged are configured
- Pre-commit runs lint and format on staged files

## Environment Variables

Client-exposed (safe to ship in the browser bundle):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key)
- `NEXT_PUBLIC_SITE_URL` — canonical production origin (e.g. `https://www.example.com`), used
  for canonical URLs, `sitemap.xml`, `robots.txt`, Open Graph URLs, and JSON-LD. Falls back to
  `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. **Set this in production** so
  SEO URLs point at the real domain.

Server-only (never prefix with `NEXT_PUBLIC_`):

- `STORAGE_SUPABASE_SECRET_KEY` (Supabase service role — bypasses RLS)
- `RESEND_API_KEY` (transactional email)
- `ADMIN_REGISTRATION_SECRET` — **required to enable admin sign-up.** `POST /api/admin/auth/register`
  fails closed: if this is unset, admin registration is disabled (503). When set, the `/admin/register`
  page must supply it in the "Invite code" field (sent as the `x-admin-invite` header).
- `ADMIN_API_TOKEN` (optional) — static bearer token alternative to Supabase-JWT admin auth.
- `ADMIN_UI_BYPASS_AUTH` (optional, dev only) — bypasses admin auth; ignored unless `NODE_ENV=development`.

## Deploy Notes (Vercel)

- `.env.local` is local-only
- Set the same env vars in Vercel Project Settings -> Environment Variables
- Security headers (CSP, HSTS, etc.) are applied globally in `next.config.ts`.
