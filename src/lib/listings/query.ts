import { z } from "zod";
import { queryListings } from "@/lib/store/memory";

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
export function fetchListings(status: "active" | "sold", query: ListQuery) {
  return queryListings(status, query);
}
