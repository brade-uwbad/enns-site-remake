import type { ListingRow } from "@/lib/store/types";

/**
 * PostgREST may return Postgres `numeric` as strings; normalize for UI and comparisons.
 */
export function normalizeListingRow(row: Record<string, unknown>): ListingRow {
  const next = { ...row } as ListingRow;
  const rawPrice = row.price_dollars;
  if (rawPrice !== null && rawPrice !== undefined) {
    const n = typeof rawPrice === "string" ? Number(rawPrice) : (rawPrice as number);
    next.price_dollars = Number.isFinite(n) ? n : null;
  }
  const rawBaths = row.baths;
  if (rawBaths !== null && rawBaths !== undefined && typeof rawBaths === "string") {
    const b = Number(rawBaths);
    next.baths = Number.isFinite(b) ? b : null;
  }
  return next;
}
