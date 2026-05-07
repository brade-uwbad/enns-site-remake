import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminListing } from "@/lib/listings/admin";
import { buildGeocodeAddress, geocodeAddress } from "@/lib/listings/geocode";
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

  let input = parsed.data;
  const needsGeocode = input.latitude === null || input.latitude === undefined || input.longitude === null || input.longitude === undefined;
  if (needsGeocode) {
    try {
      const query = buildGeocodeAddress({
        addressLine: input.addressLine,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
      });
      const point = await geocodeAddress(query);
      if (point) {
        input = { ...input, latitude: point.latitude, longitude: point.longitude };
      }
    } catch {
      // Keep create flow non-blocking if geocoding fails.
    }
  }

  const row = toListingInsert(auth.user.id, input);
  try {
    const data = await createAdminListing(row);
    return jsonOk({ listing: data }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create listing";
    return jsonError(message, 500, "LISTINGS_ERROR");
  }
}
