import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminListing } from "@/lib/listings/admin";
import { toListingInsert } from "@/lib/mappers/listing";
import { listingCreateSchema } from "@/lib/validations/listings";

/**
 * `POST /api/admin/listings` — Create a listing (requires admin bearer token).
 *
 * @param request - JSON body validated by {@link listingCreateSchema}; `Authorization: Bearer` required.
 * @returns JSON `{ data: { listing } }` with HTTP 201, or auth / validation errors.
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

  const parsed = listingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  const row = toListingInsert(auth.user.id, parsed.data);
  try {
    const data = await createAdminListing(row);
    return jsonOk({ listing: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create listing";
    return jsonError(message, 500, "LISTINGS_ERROR");
  }
}
