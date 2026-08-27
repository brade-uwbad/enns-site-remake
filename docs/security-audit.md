# Security Audit — Enns Real Estate Site

_Branch: `feat/listings-cms-ux` · Stack: Next.js 16 (App Router), React 19, Supabase, Resend, Zod._

This document records findings from a security pass over the admin/auth surface, the public
API and input surface, secrets handling, and HTTP hardening. Severity is a pragmatic
High / Medium / Low. Items marked **Fixed** were addressed in the same change set; items
marked **Action required** need a human (key rotation, infra).

## Summary

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | **High** | Ungated admin registration endpoint mints `role: admin` users | Fixed (secret gate) |
| 2 | **Medium** | No HTTP security headers (CSP, HSTS, frame, nosniff, etc.) | Fixed |
| 3 | Medium | Live service-role + Resend keys present in `.env.local` | Action required (rotate) |
| 4 | Low | `ADMIN_API_TOKEN` compared with `!==` (timing side-channel) | Fixed (timing-safe) |
| 5 | Low | `sanitizeSearchLike` allows `. ( ) *` into PostgREST `.or()` filter | Fixed (allowlist) |
| 6 | Low | Server error messages (`e.message`) returned to clients on 500s | Fixed (generic) |
| 7 | Low | In-memory rate limiting; only contact form is limited | Documented (see notes) |

## Findings

### 1. Ungated admin registration — HIGH → Fixed
`src/app/api/admin/auth/register/route.ts` used the **service-role** client to call
`supabase.auth.admin.createUser({ ..., email_confirm: true, app_metadata: { role: "admin" } })`
(`src/lib/auth/admin-user-metadata.ts`) with **no authorization gate**. Any unauthenticated
client that could POST valid JSON to this route received a fully-confirmed admin account with
complete CMS access (create/edit/delete listings, edit site content, manage reviews, read
contact leads).

**Fix:** the route now requires a shared secret `ADMIN_REGISTRATION_SECRET`, supplied via the
`x-admin-invite` request header, and rejects with 401 when it is missing/incorrect (or 503 if
the secret is not configured on the server, so registration fails closed). Constant-time
comparison is used to avoid leaking the secret via timing.

### 2. Missing HTTP security headers — MEDIUM → Fixed
`next.config.ts` previously set only `images.remotePatterns` and `redirects`. No CSP, HSTS,
`X-Content-Type-Options`, frame protection, `Referrer-Policy`, or `Permissions-Policy`.

**Fix:** added an `async headers()` block applying a baseline set to all routes: HSTS,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Frame-Options: DENY`, a restrictive `Permissions-Policy`, and a Content-Security-Policy
scoped to `'self'` plus the allowed image hosts (`*.supabase.co`, `placehold.co`,
`images.unsplash.com`). CSP allows the inline styles/fonts Next.js requires
(`'unsafe-inline'` for `style-src`; `data:`/`blob:` images). See config comments for the
tightening path (nonces) once inline usage is inventoried.

### 3. Live secrets in `.env.local` — MEDIUM → Action required
`.env.local` contains a real Supabase service-role key (`sb_secret_…`, RLS-bypassing) and a
`RESEND_API_KEY`. The file is **not** tracked by git (`.gitignore` covers `.env*`, confirmed
via `git ls-files`), so this is not a repo leak. However, because these keys have been on a
developer workstation, rotate both before/at production launch:
- Supabase: roll the service-role/secret key in the dashboard, update the deployment env.
- Resend: roll the API key.
No secret is read from a `NEXT_PUBLIC_*` variable — verified in `src/lib/supabase/server.ts`
and `src/lib/supabase/public-config.ts` (service key only ever comes from `STORAGE_*` /
`SUPABASE_*` server vars).

### 4. Static admin token timing side-channel — LOW → Fixed
`requireAdmin` (`src/lib/auth/admin.ts`) compared `token !== staticAdminToken` with `!==`,
which short-circuits and is theoretically timing-observable.
**Fix:** replaced with a constant-time comparison helper (`crypto.timingSafeEqual` on equal-
length buffers, length-guarded).

### 5. Search sanitization gap — LOW → Fixed
`sanitizeSearchLike` (`src/lib/listings/query.ts`) stripped `% _ \ ,` but not `.`, `(`, `)`,
or `*`. The result is interpolated into a PostgREST filter string
`db.or("title.ilike.%<q>%,city.ilike.%<q>%")`, where `.` `(` `)` are structural characters —
crafted input could distort the OR expression (query breakage / logic manipulation; not a
classic SQLi because PostgREST parses the filter grammar, and RLS still bounds results).
**Fix:** switched to a conservative allowlist (letters, digits, spaces, hyphen) so only
benign characters reach the filter builder.

### 6. Internal error messages leaked to clients — LOW → Fixed
Several handlers returned `e.message` on 500 (e.g. `src/app/api/listings/route.ts`,
`src/app/api/admin/listings/route.ts`, upload routes), which can surface DB/driver detail.
**Fix:** 500 responses now return a generic message; the detail is logged server-side with
`console.error`. Validation (4xx) messages remain specific and safe.

### 7. Rate limiting — LOW → Documented
`src/lib/rate-limit.ts` is a per-process in-memory fixed window (5/hr per IP) applied only to
the contact server action (`src/app/contact/actions.ts`). On Vercel's serverless/edge runtime
this state is **not shared across instances** and resets on redeploy, so it is best-effort.
Notes:
- The `/api/auth/login` and `/api/auth/register` routes are **unwired placeholders**; real
  end-user login uses the Supabase client SDK, which Supabase rate-limits server-side.
- The admin registration route is now secret-gated (finding 1), which removes the practical
  brute-force concern there.
- **Recommendation (not blocking):** for production, back rate limiting with a shared store
  (Upstash Redis / Vercel KV) and extend it to the registration and upload routes. Left as a
  documented TODO in `src/lib/rate-limit.ts`.

## Things verified as OK (no action)
- **RLS** is enabled on every table (`supabase/migrations/core_schema_rls_seed.sql`): public
  `SELECT`-only policies scoped to published data (`listings` active/sold, `reviews`
  `is_visible`), and `contact_submissions` has **no** anon policies (service-role writes only).
- **All 8 privileged route handlers** under `src/app/api/admin/**` (except the now-gated
  `auth/register`) call `requireAdmin` before doing any work.
- **Three auth layers agree** (middleware, page gate, API gate) on the admin-role check
  (`isAdminJwtUser`).
- **`ADMIN_UI_BYPASS_AUTH`** is gated to `NODE_ENV === "development"` and cannot enable in a
  production build.
- **Upload route** enforces `image/*` MIME and a 10 MB size cap and is behind `requireAdmin`.
- The public read client uses the anon/publishable key, so RLS applies to all public reads.

## Verification performed

- `npx tsc --noEmit` — clean. `npm run lint` — only 3 pre-existing errors + 1 warning, all in
  files untouched by this work (`editor-photos-panel.tsx`, `reviews-manager.tsx`,
  `revalidate.ts`); no regressions.
- **Admin registration gate** (`POST /api/admin/auth/register`), against a local dev server:
  - no `x-admin-invite` header → **401**;
  - wrong secret → **401** (`Invalid or missing admin invite secret`);
  - correct secret → passes the gate (**200**, account created).
  - with `ADMIN_REGISTRATION_SECRET` unset → **503** (fails closed).
  (The test admin account created by the 200-path was deleted afterward via the service role.)
- **Security headers** — `curl -I` on the homepage confirmed CSP, HSTS,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`
  are present.
- **Search sanitization** — listing search with `)(.* `, `O'Brien`, and `100%off` all return
  HTTP 200 (no 500, no filter breakage).
