import { jsonError, jsonOk } from "@/lib/api/http";
import { fetchListings, listQuerySchema } from "@/lib/listings/query";

/**
 * `GET /api/listings` — Paginated active listings with optional filters (`page`, `limit`, price, beds, city, `q`).
 *
 * @param request - URL may include query string parameters validated by {@link listQuerySchema}.
 * @returns JSON `{ data: { listings, pagination } }`, or a validation / server error payload.
 */
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listQuerySchema.safeParse(params);
  if (!parsed.success) {
    return jsonError("Invalid query parameters", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  try {
    const { items, total } = await fetchListings("active", parsed.data);
    return jsonOk({
      listings: items,
      pagination: {
        page: parsed.data.page,
        limit: parsed.data.limit,
        total,
        totalPages: Math.ceil(total / parsed.data.limit),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load listings";
    return jsonError(message, 500, "LISTINGS_ERROR");
  }
}
