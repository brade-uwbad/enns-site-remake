import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { insertReview } from "@/lib/store/memory";
import { reviewCreateSchema } from "@/lib/validations/reviews";

/**
 * `POST /api/admin/reviews` — Create a testimonial row (admin bearer token).
 *
 * @param request - JSON body validated by {@link reviewCreateSchema}.
 * @returns JSON `{ data: { review } }` with HTTP 201, or auth / validation errors.
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

  const data = insertReview({
    author_name: parsed.data.authorName,
    body: parsed.data.body,
    rating: parsed.data.rating ?? null,
    is_visible: parsed.data.isVisible ?? true,
  });

  return jsonOk({ review: data }, { status: 201 });
}
