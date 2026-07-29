/**
 * Canonical site identity used for SEO: `metadataBase`, canonical URLs, the sitemap,
 * robots, Open Graph image resolution, and JSON-LD structured data.
 */

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function withProtocol(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/**
 * Resolves the canonical site origin (scheme + host, no trailing slash).
 *
 * Resolution order:
 * 1. `NEXT_PUBLIC_SITE_URL` — set this to the production domain (e.g. `https://www.example.com`).
 *    This is the value to configure in production; everything else is a fallback.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — Vercel's production domain, used automatically on deploys
 *    when the explicit var is not set.
 * 3. `http://localhost:3000` — local development default.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return stripTrailingSlash(withProtocol(explicit));
  }
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) {
    return `https://${stripTrailingSlash(vercel)}`;
  }
  return "http://localhost:3000";
}

/** Canonical site origin, e.g. `https://www.example.com` (no trailing slash). */
export const SITE_URL = resolveSiteUrl();

/** Absolute URL for a site-relative path, e.g. `absoluteUrl("/listings")`. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Human-facing site/brand name. */
export const SITE_NAME = "Brad Enns Real Estate";

/** Agent name used across metadata and structured data. */
export const AGENT_NAME = "Brad Enns";

/** One-line site description reused as an Open Graph / structured-data default. */
export const SITE_DESCRIPTION =
  "Real estate services for buying, selling, and appraisals in Kitchener–Waterloo and surrounding communities.";

/** Communities served, used for structured data `areaServed`. */
export const AREAS_SERVED = [
  "Kitchener",
  "Waterloo",
  "Cambridge",
  "Elmira",
  "New Hamburg",
] as const;
