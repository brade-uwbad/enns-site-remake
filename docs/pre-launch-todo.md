# Pre-Launch To-Do

_Branch `feat/listings-cms-ux` · PR [#64](https://github.com/brade-uwbad/enns-site-remake/pull/64)_

Security + SEO code is done and pushed. What's left is config/human actions.
Detail: [`security-audit-status.md`](./security-audit-status.md), [`seo-audit.md`](./seo-audit.md).

## ⛔ Before launch
- [ ] **Rotate secrets** — Supabase service-role key + `RESEND_API_KEY`; set new values in Vercel env (not `.env.local`).
- [ ] **Set `NEXT_PUBLIC_SITE_URL`** to the real domain in Vercel (fixes canonicals/sitemap/OG URLs).
- [ ] **Decide `ADMIN_REGISTRATION_SECRET`** — set it in Vercel to allow gated admin sign-up, or leave unset to keep sign-up disabled.
- [ ] **Verify headers** post-deploy: `curl -I https://<domain>` shows CSP, HSTS, etc.

## 🔶 Recommended
- [ ] Shared-store rate limiting (Upstash/Vercel KV); extend to admin + upload routes. (`TODO` in `src/lib/rate-limit.ts`.)
- [ ] Nonce-based CSP — drop `'unsafe-inline'` (see `next.config.ts`).
- [ ] Google Search Console: verify + submit `sitemap.xml`; run Rich Results Test on home + a listing.
- [ ] Add numeric ratings to reviews so `AggregateRating` renders.
- [ ] Optional `/security-review` pass before merge.

> PR #64 bundles all 8 unmerged branch commits, not just the 3 security/SEO ones.
