import { z } from "zod";
import { getSupabaseReadClient, hasSupabaseReadConfig } from "@/lib/supabase/server";
import { queryListings } from "@/lib/store/memory";
import type { ListingRow } from "@/lib/store/types";

/**
 * Zod schema for listing collection query parameters (`page`, `limit`, filters, search).
 *
 * @remarks
 * Price filters use whole dollars in the query string; the store compares against `price_cents`.
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  /** Whole dollars (integer); converted to cents for filtering. */
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  beds: z.coerce.number().int().min(0).optional(),
  city: z.string().max(120).optional(),
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
  return value.replace(/[%_\\]/g, "").replace(/,/g, " ").trim();
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
    db = db.gte("price_cents", query.minPrice * 100);
  }
  if (query.maxPrice !== undefined) {
    db = db.lte("price_cents", query.maxPrice * 100);
  }
  if (query.beds !== undefined) {
    db = db.eq("beds", query.beds);
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

  return { items: (data ?? []) as ListingRow[], total: count ?? 0 };
}

export async function fetchPublicListingById(id: string) {
  if (!hasSupabaseReadConfig()) {
    const active = queryListings("active", { page: 1, limit: 1000 }).items.find((l) => l.id === id);
    if (active) return active;
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

  return (data as ListingRow | null) ?? null;
}
