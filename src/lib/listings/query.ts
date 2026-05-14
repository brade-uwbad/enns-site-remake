import { z } from "zod";
import { normalizeListingRow } from "@/lib/listings/normalize-listing";
import { getSupabaseReadClient, hasSupabaseReadConfig } from "@/lib/supabase/server";
import { queryListings } from "@/lib/store/memory";

/**
 * Zod schema for listing collection query parameters (`page`, `limit`, filters, search).
 *
 * @remarks
 * `minPrice` / `maxPrice` use dollars, matching `price_dollars` in the database.
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  beds: z.coerce.number().int().min(0).optional(),
  city: z.string().max(120).optional(),
  propertyType: z.enum(["apartment", "detached", "townhouse", "condo"]).optional(),
  q: z.string().max(200).optional(),
});

/** Parsed listing list query parameters. */
export type ListQuery = z.infer<typeof listQuerySchema>;

/**
 * Returns a page of listings for the public API by delegating to the in-memory store.
 *
 * @param status - Only listings with this status (`active` or `sold`) are considered.
 * @param query - Pagination and filter options (validated with {@link listQuerySchema}).
 * @returns `items` for the requested page and `total` count after filters (before pagination).
 */
function sanitizeSearchLike(value: string) {
  return value
    .replace(/[%_\\]/g, "")
    .replace(/,/g, " ")
    .trim();
}

export async function fetchListings(status: "active" | "sold", query: ListQuery) {
  if (!hasSupabaseReadConfig()) {
    return queryListings(status, query);
  }

  const from = (query.page - 1) * query.limit;
  const to = from + query.limit - 1;
  const supabase = getSupabaseReadClient();

  let db = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", status)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (query.minPrice !== undefined) {
    db = db.gte("price_dollars", query.minPrice);
  }
  if (query.maxPrice !== undefined) {
    db = db.lte("price_dollars", query.maxPrice);
  }
  if (query.beds !== undefined) {
    db = db.eq("beds", query.beds);
  }
  if (query.propertyType) {
    db = db.eq("property_type", query.propertyType);
  }
  if (query.city?.trim()) {
    db = db.ilike("city", `%${sanitizeSearchLike(query.city)}%`);
  }
  if (query.q?.trim()) {
    const q = sanitizeSearchLike(query.q);
    db = db.or(`title.ilike.%${q}%,city.ilike.%${q}%`);
  }

  const { data, error, count } = await db;
  if (error) {
    throw new Error(error.message);
  }

  const items = (data ?? []).map((row) => normalizeListingRow(row as Record<string, unknown>));
  return { items, total: count ?? 0 };
}

export async function fetchPublicListingById(id: string) {
  if (!hasSupabaseReadConfig()) {
    const active = queryListings("active", { page: 1, limit: 1000 }).items.find((l) => l.id === id);
    if (active) {
      return active;
    }
    const sold = queryListings("sold", { page: 1, limit: 1000 }).items.find((l) => l.id === id);
    return sold ?? null;
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .in("status", ["active", "sold"])
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? normalizeListingRow(data as Record<string, unknown>) : null;
}

type PostalCentroid = { latitude: number; longitude: number };

/**
 * Returns centroid points for known postal prefixes (e.g. Canadian FSAs like M5V).
 * Missing prefixes are omitted from the returned map.
 */
export async function fetchPostalCentroids(
  postalPrefixes: string[],
): Promise<Record<string, PostalCentroid>> {
  const uniq = Array.from(
    new Set(postalPrefixes.map((p) => p.trim().toUpperCase()).filter(Boolean)),
  );
  if (uniq.length === 0 || !hasSupabaseReadConfig()) {
    return {};
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("postal_code_centroids")
    .select("postal_prefix, latitude, longitude")
    .in("postal_prefix", uniq);

  // If table/query is unavailable, caller can gracefully fall back to non-distance ranking.
  if (error || !data) {
    return {};
  }

  const out: Record<string, PostalCentroid> = {};
  for (const row of data as Array<Record<string, unknown>>) {
    const prefixRaw = row.postal_prefix;
    const latRaw = row.latitude;
    const lngRaw = row.longitude;
    if (typeof prefixRaw !== "string") {
      continue;
    }
    const latitude = typeof latRaw === "string" ? Number(latRaw) : (latRaw as number);
    const longitude = typeof lngRaw === "string" ? Number(lngRaw) : (lngRaw as number);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }
    out[prefixRaw.trim().toUpperCase()] = { latitude, longitude };
  }
  return out;
}
