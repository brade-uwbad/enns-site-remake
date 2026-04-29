import { jsonError, jsonOk } from "@/lib/api/http";
import { fetchPublicListingById } from "@/lib/listings/query";

/** Next.js 15+ dynamic route context: `params` is async. */
type Params = { params: Promise<{ id: string }> };

/**
 * `GET /api/listings/[id]` — Public detail for one listing (404 if missing or draft).
 *
 * @param _request - Unused; reserved for future ETag / caching headers.
 * @param ctx - Dynamic segment `id` (listing UUID).
 * @returns JSON `{ data: { listing } }`, or 404 when not found.
 */
export async function GET(_request: Request, ctx: Params) {
  const { id } = await ctx.params;
  if (!id) {
    return jsonError("Listing id is required", 400, "BAD_REQUEST");
  }

  const data = await fetchPublicListingById(id);
  if (!data) {
    return jsonError("Listing not found", 404, "NOT_FOUND");
  }

  return jsonOk({ listing: data });
}
