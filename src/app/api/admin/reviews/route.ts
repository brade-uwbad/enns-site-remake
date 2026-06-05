import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { createReviewAdmin, fetchAllReviewsAdmin } from "@/lib/reviews/admin";
import { reviewCreateSchema } from "@/lib/validations/reviews";

/**
 * `GET /api/admin/reviews` — List all testimonials for admin curation.
 */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  try {
    const reviews = await fetchAllReviewsAdmin();
    return jsonOk({ reviews });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Could not load reviews", 500, "INTERNAL_ERROR");
  }
}

/**
 * `POST /api/admin/reviews` — Create a testimonial.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = reviewCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  try {
    const review = await createReviewAdmin(parsed.data);
    return jsonOk({ review }, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Could not create review", 400, "BAD_REQUEST");
  }
}
