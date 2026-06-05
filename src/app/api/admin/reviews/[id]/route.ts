import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { deleteReviewAdmin, updateReviewAdmin } from "@/lib/reviews/admin";
import { reviewUpdateSchema } from "@/lib/validations/reviews";

type Params = { params: Promise<{ id: string }> };

/**
 * `PATCH /api/admin/reviews/[id]` — Update testimonial fields or curation flags.
 */
export async function PATCH(request: Request, ctx: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  const { id } = await ctx.params;
  if (!id) {
    return jsonError("Review id is required", 400, "BAD_REQUEST");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = reviewUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  try {
    const review = await updateReviewAdmin(id, parsed.data);
    return jsonOk({ review });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update review";
    const status = message === "Review not found" ? 404 : 400;
    return jsonError(message, status, status === 404 ? "NOT_FOUND" : "BAD_REQUEST");
  }
}

/**
 * `DELETE /api/admin/reviews/[id]` — Remove a testimonial.
 */
export async function DELETE(request: Request, ctx: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  const { id } = await ctx.params;
  if (!id) {
    return jsonError("Review id is required", 400, "BAD_REQUEST");
  }

  try {
    await deleteReviewAdmin(id);
    return jsonOk({ deleted: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete review";
    return jsonError(message, message === "Review not found" ? 404 : 400, "NOT_FOUND");
  }
}
