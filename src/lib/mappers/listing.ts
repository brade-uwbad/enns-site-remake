import type { ListingRow } from "@/lib/store/types";
import type { ListingCreateInput, ListingUpdateInput } from "@/lib/validations/listings";

/**
 * Maps a validated API create body (camelCase) to a row shape for the listings store (snake_case DB-style fields).
 *
 * @param userId - Authenticated user id stored as `created_by`.
 * @param input - Validated {@link ListingCreateInput} from the admin POST body.
 * @returns Fields required to insert a listing, excluding server-generated `id` and timestamps.
 */
export function toListingInsert(
  userId: string,
  input: ListingCreateInput,
): Omit<ListingRow, "id" | "created_at" | "updated_at"> {
  return {
    title: input.title,
    subtitle: input.subtitle ?? null,
    slug: input.slug ?? null,
    description: input.description ?? null,
    price_cents: input.priceCents ?? null,
    address_line1: input.addressLine1 ?? null,
    city: input.city ?? null,
    province: input.province ?? null,
    postal_code: input.postalCode ?? null,
    beds: input.beds ?? null,
    baths: input.baths ?? null,
    sqft: input.sqft ?? null,
    status: input.status,
    sold_at: null,
    amenities: input.amenities ?? [],
    featured_image_url: input.featuredImageUrl ?? null,
    images: input.images ?? [],
    created_by: userId,
  };
}

/**
 * Maps a validated API partial update body (camelCase) to patch fields on {@link ListingRow}.
 *
 * @param input - Validated {@link ListingUpdateInput}; only defined keys are copied.
 * @returns A partial row with snake_case keys suitable for {@link updateListingById}.
 */
export function toListingUpdate(input: ListingUpdateInput): Partial<ListingRow> {
  const row: Partial<ListingRow> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.subtitle !== undefined) row.subtitle = input.subtitle;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.priceCents !== undefined) row.price_cents = input.priceCents;
  if (input.addressLine1 !== undefined) row.address_line1 = input.addressLine1;
  if (input.city !== undefined) row.city = input.city;
  if (input.province !== undefined) row.province = input.province;
  if (input.postalCode !== undefined) row.postal_code = input.postalCode;
  if (input.beds !== undefined) row.beds = input.beds;
  if (input.baths !== undefined) row.baths = input.baths;
  if (input.sqft !== undefined) row.sqft = input.sqft;
  if (input.status !== undefined) row.status = input.status;
  if (input.amenities !== undefined) row.amenities = input.amenities;
  if (input.featuredImageUrl !== undefined) row.featured_image_url = input.featuredImageUrl;
  if (input.images !== undefined) row.images = input.images;
  if (input.soldAt !== undefined) row.sold_at = input.soldAt;
  return row;
}
