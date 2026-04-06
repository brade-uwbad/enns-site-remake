import { jsonOk } from "@/lib/api/http";
import { listReviews } from "@/lib/store/memory";

/**
 * `GET /api/reviews` — Public list of visible reviews (newest first in the store).
 *
 * @returns JSON `{ data: { reviews } }`.
 */
export async function GET() {
  return jsonOk({ reviews: listReviews() });
}
