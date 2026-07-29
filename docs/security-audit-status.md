# Security Audit — Status & Remaining Work

_Branch: `feat/listings-cms-ux` · Last updated: 2026-07-22_

Companion to [`security-audit.md`](./security-audit.md) (the detailed findings). This page is
the at-a-glance **status board**: what has been done, and what still needs doing before the
site is production-ready from a security standpoint.

---

## ✅ Done (implemented & verified)

All items below are committed as code changes and verified (`tsc` clean; end-to-end tested
against a local dev server where noted).

| # | Item | What changed | Verified |
|---|------|--------------|----------|
| 1 | **Gated admin registration** (was High-severity: anyone could mint a `role:admin` account) | `POST /api/admin/auth/register` now requires the `ADMIN_REGISTRATION_SECRET` shared secret via the `x-admin-invite` header; fails closed (503) when unset; constant-time secret compare. The `/admin/register` page gained an "Invite code" field. | ✅ 401 on missing/wrong secret, 200 on correct, 503 when unset |
| 2 | **HTTP security headers** | Added `async headers()` in `next.config.ts`: CSP, HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. | ✅ `curl -I` shows all headers on homepage |
| 3 | **Constant-time `ADMIN_API_TOKEN` compare** | New `src/lib/auth/timing-safe-equal.ts`; replaced `!==` in `src/lib/auth/admin.ts`. | ✅ tsc |
| 4 | **Tightened search sanitization** | `sanitizeSearchLike` (`src/lib/listings/query.ts`) now allowlists letters/digits/space/hyphen so `. ( ) *` can't distort the PostgREST `.or()` filter. | ✅ odd-char searches return 200, no breakage |
| 5 | **Generic error responses** | ~13 catch blocks across 8 API routes no longer return `e.message`; detail is logged server-side, clients get a generic message. | ✅ tsc |
| 6 | **Rate-limit limitation documented** | `src/lib/rate-limit.ts` has a `TODO(security)` explaining the per-process in-memory limitation and the shared-store recommendation. | ✅ |
| 7 | **Env/setup documentation** | `SETUP_REQUIREMENTS.md` documents all client vs. server-only env vars, including `ADMIN_REGISTRATION_SECRET`. | ✅ |

**Also confirmed OK during the audit (no change needed):** RLS enabled on every table with
`SELECT`-only public policies scoped to published data; `contact_submissions` locked to
service-role; all 8 privileged `/api/admin/**` handlers call `requireAdmin`; the three auth
layers (middleware, page gate, API gate) agree on the admin check; `ADMIN_UI_BYPASS_AUTH` is
dev-only; upload routes enforce MIME + 10 MB limits behind `requireAdmin`; no secret is read
from a `NEXT_PUBLIC_*` variable.

---

## ⛔ Remaining — required before production launch

### R1. Rotate the live secrets — **human action, only you can do this**
`.env.local` holds a real Supabase service-role key (`sb_secret_…`, RLS-bypassing) and a live
`RESEND_API_KEY`. They are **not** in git (confirmed), but since they've lived on a workstation
they should be rotated:
- [ ] Roll the Supabase service-role / secret key in the Supabase dashboard.
- [ ] Roll the `RESEND_API_KEY` in the Resend dashboard.
- [ ] Update the new values in Vercel Project Settings → Environment Variables (not `.env.local`).

### R2. Set `ADMIN_REGISTRATION_SECRET` in the deployment environment
The registration gate fails **closed** — if this var is not set in production, admin sign-up is
disabled entirely (503). Decide and configure:
- [ ] Generate a strong random secret and set it in Vercel env (all environments where sign-up
      should work).
- [ ] Share it out-of-band with whoever needs to create admin accounts (they enter it in the
      "Invite code" field on `/admin/register`).
- [ ] _Alternative for a single-agent site:_ create the one admin account, then **leave the var
      unset** in production so the route stays disabled. (Your call — see Open Question O1.)

---

## 🔶 Remaining — recommended, not blocking

### R3. Production-grade rate limiting
Current limiter is per-process/in-memory (best-effort on serverless; resets on redeploy, not
shared across instances) and only guards the contact form.
- [ ] Back it with a shared store (Upstash Redis / Vercel KV).
- [ ] Extend limiting to the admin registration and upload routes.
- Tracked as `TODO(security)` in `src/lib/rate-limit.ts`.

### R4. Tighten the Content-Security-Policy
The CSP currently allows `'unsafe-inline'` for `style-src` (and inline scripts for Next.js
hydration), which is the pragmatic baseline.
- [ ] Once inline style/script usage is inventoried, move to a **nonce-based** CSP and drop
      `'unsafe-inline'`. See the comment in `next.config.ts`.

### R5. Optional second-pass review
- [ ] Run the `/security-review` skill on the branch diff as an independent check before merge.

---

## ❓ Open questions to resolve

- **O1 — Admin registration model:** keep self-serve sign-up gated by the shared secret, or
  create the single admin once and disable the route (leave `ADMIN_REGISTRATION_SECRET` unset)
  in production? Current code supports both; it's a config decision.
- **O2 — Rate-limit store:** wire Upstash/Vercel KV now (R3), or ship with the documented TODO
  and revisit post-launch?

---

## Quick pre-launch checklist

- [ ] R1 — rotate Supabase + Resend keys, update deployment env
- [ ] R2 — set (or intentionally omit) `ADMIN_REGISTRATION_SECRET` in production
- [ ] Confirm security headers on the deployed domain (`curl -I https://<domain>`)
- [ ] (Recommended) R3 — shared-store rate limiting
- [ ] (Recommended) R4 — nonce-based CSP
- [ ] (Recommended) R5 — `/security-review` pass on the diff
