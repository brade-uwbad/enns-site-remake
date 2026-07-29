# SEO Audit & Improvements — Enns Real Estate Site

_Branch: `feat/listings-cms-ux` · Last updated: 2026-07-22_

A technical-SEO pass over the site: crawlability (robots + sitemap), structured data,
canonical/social metadata, and caching. The site's value is being found by local buyers and
sellers in Kitchener–Waterloo, so the focus is on the fundamentals search engines expect.

## Summary

| # | Area | Before | Status |
|---|------|--------|--------|
| 1 | Sitemap & robots | none | **Added** (`sitemap.ts`, `robots.ts`) |
| 2 | Canonical URLs | none | **Added** (every public page) |
| 3 | `metadataBase` + Open Graph / Twitter | OG on listing detail only, no base | **Added** site-wide + per page |
| 4 | Structured data (JSON-LD) | none | **Added** (agent, listing, breadcrumb, reviews) |
| 5 | Admin `noindex` | already present | **Verified OK** |
| 6 | Caching | `force-dynamic` everywhere | **Improved** on listing routes (ISR + on-demand) |
| 7 | Image `alt` text | hero empty | **Fixed** hero; grid already had alt |

## What was already good (kept)

- All public pages are server components — fully server-rendered and crawlable.
- Per-route `metadata` / `generateMetadata` on `/`, `/listings`, `/listings/[id]`, `/about`,
  `/services`, `/contact`; a title template (`%s | Brad Enns`) in the root layout.
- `next/image` throughout, with `images.remotePatterns` configured.
- Ten legacy→new **301 redirects** in `next.config.ts` preserving link equity from the old site.
- Admin routes already carried `robots: { index: false, follow: false }`.

## Changes implemented

### 1. Sitemap & robots — `src/app/sitemap.ts`, `src/app/robots.ts`
- `robots.txt`: allows all, disallows `/admin` and `/api`, declares `Host` and points at the
  sitemap.
- `sitemap.xml`: five static routes plus **every public listing** (active + sold), pulled from
  `fetchListings(...)`, using each listing's `updated_at` as `lastModified`. Revalidates hourly
  so new/sold listings surface without a redeploy. Fails soft to the static routes if listings
  can't be loaded.

### 2. Canonicals & the site origin — `src/lib/site-config.ts`
- New `SITE_URL` helper resolves the canonical origin from `NEXT_PUBLIC_SITE_URL`
  (→ `VERCEL_PROJECT_PRODUCTION_URL` → `http://localhost:3000`). This one value feeds
  `metadataBase`, canonicals, the sitemap, robots, OG URLs, and JSON-LD `@id`s.
- `metadataBase` set in the root layout so all relative OG/canonical URLs resolve to absolute.
- `alternates.canonical` set on `/` (layout default), `/listings`, `/about`, `/services`,
  `/contact`, and per-listing in `generateMetadata`. (Each page must set its own canonical to
  override the layout default — done.)

### 3. Open Graph / Twitter — `src/app/layout.tsx` + pages
- Site-wide default `openGraph` (`type`, `siteName`, `locale: en_CA`, url) and a
  `twitter: summary_large_image` card in the root layout.
- Per-page OG title/description/url on the marketing pages.
- Listing detail: OG **and** Twitter now emit the listing's image as an **absolute** URL
  (resolved via `metadataBase`), plus `og:url`/canonical.

### 4. Structured data (JSON-LD) — `src/components/seo/json-ld.tsx`
- Small `<JsonLd>` helper renders `application/ld+json` (allowed by the existing CSP).
- **`RealEstateAgent`** in the root layout (`@id` `…/#agent`): name, url, `areaServed`
  (Kitchener, Waterloo, Cambridge, Elmira, New Hamburg), `knowsAbout`, region.
- **`RealEstateListing` + `BreadcrumbList`** on listing detail: name, description, images,
  price `Offer` (CAD, in-stock vs. sold-out), postal address, geo coordinates, and a `broker`
  reference back to the agent `@id`.
- **`RealEstateAgent` review graph** on `/about`: the featured `Review`s, plus an
  `AggregateRating` computed from those with a numeric rating (omitted when none are rated).

### 5. Caching — listing routes
- `/listings` (server shell for a client-fetched grid) and `/sitemap.xml` are now statically
  cached with hourly ISR (`export const revalidate = 3600`).
- `/listings/[id]` sets `revalidate = 3600`; the admin **create / update / delete** routes call
  `revalidatePath("/listings/<id>")` and `revalidatePath("/listings")` so edits and removals
  propagate immediately rather than waiting out the window.
- The content-driven marketing pages (`/`, `/about`, `/services`, `/contact`) remain
  request-time rendered so CMS edits show instantly; content edits already call
  `revalidatePath` via `revalidateSiteContent`.

### 6. Image alt text — `src/components/home/home-hero.tsx`
- The hero background image had `alt=""`; it now carries descriptive, location-relevant alt.
- The listings grid card image already used `alt={listing.title}` — left as is.

## Verification performed

- `npm run build` — clean. Route table shows `/robots.txt`, `/sitemap.xml` (1h), and
  `/listings` (1h) as static; `tsc` and targeted `eslint` clean.
- With `NEXT_PUBLIC_SITE_URL` set, against the running server:
  - `/robots.txt` — correct allow/disallow, host, and sitemap line.
  - `/sitemap.xml` — static routes + live listing IDs with `lastmod`.
  - Home `<head>` — canonical, full OG, Twitter card, and `RealEstateAgent` JSON-LD.
  - Listing `<head>` — canonical, absolute OG/Twitter image, `RealEstateListing` + `BreadcrumbList`.
  - `/about` — canonical + review JSON-LD.
  - `/admin/register` — `noindex, nofollow` confirmed.

## Remaining / recommended (not blocking)

- **Set `NEXT_PUBLIC_SITE_URL`** to the real production domain in the deployment env — until
  then canonicals/sitemap/OG fall back to the Vercel domain (or localhost locally). This is the
  one required config step for SEO to be fully correct. _(See Open Question O3.)_
- **Google Search Console**: add a `verification` meta (or DNS record) once you have the token,
  then submit `sitemap.xml`.
- **Validate rich results**: after deploy, run Google's Rich Results Test on the home page and a
  listing URL to confirm the agent/listing/breadcrumb data parses.
- **Reviews with ratings**: `AggregateRating` only appears once reviews carry a numeric `rating`
  (current sample reviews have none) — encourage capturing a star rating per review.
- **Per-listing OG image dimensions**: optionally add width/height to OG images for cleaner
  social previews.
