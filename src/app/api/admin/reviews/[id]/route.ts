import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { deleteReviewById } from "@/lib/store/memory";

type Params = { params: Promise<{ id: string }> };

/**
 * `DELETE /api/admin/reviews/[id]` — Delete a review by id (admin bearer token).
 *
 * @param request - Unused; auth uses headers.
 * @param ctx - Dynamic segment `id` (review UUID).
 * @returns JSON `{ data: { deleted: true, id } }`, or 401 / 404.
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

  const ok = deleteReviewById(id);
  if (!ok) {
    return jsonError("Review not found", 404, "NOT_FOUND");
  }

  return jsonOk({ deleted: true, id });
}
