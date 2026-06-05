import { jsonOk } from "@/lib/api/http";
import { fetchFeaturedReviews, fetchVisibleReviews } from "@/lib/reviews/query";

/**
 * `GET /api/reviews` — Public testimonials.
 *
 * Query `featured=1` returns up to 3 curated reviews for the About page.
 * Default returns all visible reviews (newest first).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured") === "1" || searchParams.get("featured") === "true";

  const reviews = featured ? await fetchFeaturedReviews() : await fetchVisibleReviews();
  return jsonOk({ reviews });
}
