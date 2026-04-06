import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { toListingUpdate } from "@/lib/mappers/listing";
import { deleteListingById, getListingById, updateListingById } from "@/lib/store/memory";
import { listingUpdateSchema } from "@/lib/validations/listings";

type Params = { params: Promise<{ id: string }> };

/**
 * `PUT /api/admin/listings/[id]` — Partial update of a listing (admin bearer token).
 *
 * @param request - JSON body validated by {@link listingUpdateSchema}.
 * @param ctx - Dynamic segment `id` (listing UUID).
 * @returns JSON `{ data: { listing } }`, or 401 / 404 / validation errors.
 */
export async function PUT(request: Request, ctx: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  const { id } = await ctx.params;
  if (!id) {
    return jsonError("Listing id is required", 400, "BAD_REQUEST");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = listingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  const existing = getListingById(id);
  if (!existing) {
    return jsonError("Listing not found", 404, "NOT_FOUND");
  }

  const patch = toListingUpdate(parsed.data);
  const data = updateListingById(id, patch);
  if (!data) {
    return jsonError("Listing not found", 404, "NOT_FOUND");
  }

  return jsonOk({ listing: data });
}

/**
 * `DELETE /api/admin/listings/[id]` — Remove a listing by id (admin bearer token).
 *
 * @param request - Unused; auth uses headers.
 * @param ctx - Dynamic segment `id` (listing UUID).
 * @returns JSON `{ data: { deleted: true, id } }`, or 401 / 404.
 */
export async function DELETE(request: Request, ctx: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  const { id } = await ctx.params;
  if (!id) {
    return jsonError("Listing id is required", 400, "BAD_REQUEST");
  }

  const ok = deleteListingById(id);
  if (!ok) {
    return jsonError("Listing not found", 404, "NOT_FOUND");
  }

  return jsonOk({ deleted: true, id });
}
