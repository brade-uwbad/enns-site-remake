import type { ListingRow } from "@/lib/store/types";
import type { ListingCreateInput, ListingUpdateInput } from "@/lib/validations/listings";

function roundDollars(n: number | null | undefined): number | null {
  if (n === null || n === undefined) {
    return null;
  }
  return Math.round(n * 100) / 100;
}

function normalizePostalCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const compact = value.replace(/\s+/g, "").toUpperCase();
  if (!compact) {
    return null;
  }
  if (compact.length === 6) {
    return `${compact.slice(0, 3)} ${compact.slice(3)}`;
  }
  return compact;
}

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
    price_dollars: roundDollars(input.priceDollars ?? null),
    address_line: input.addressLine ?? null,
    city: input.city ?? null,
    province: input.province ?? null,
    postal_code: normalizePostalCode(input.postalCode),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    beds: input.beds ?? null,
    baths: input.baths ?? null,
    sqft: input.sqft ?? null,
    property_type: input.propertyType ?? null,
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
  if (input.title !== undefined) {
    row.title = input.title;
  }
  if (input.subtitle !== undefined) {
    row.subtitle = input.subtitle;
  }
  if (input.slug !== undefined) {
    row.slug = input.slug;
  }
  if (input.description !== undefined) {
    row.description = input.description;
  }
  if (input.priceDollars !== undefined) {
    row.price_dollars = roundDollars(input.priceDollars);
  }
  if (input.addressLine !== undefined) {
    row.address_line = input.addressLine;
  }
  if (input.city !== undefined) {
    row.city = input.city;
  }
  if (input.province !== undefined) {
    row.province = input.province;
  }
  if (input.postalCode !== undefined) {
    row.postal_code = normalizePostalCode(input.postalCode);
  }
  if (input.latitude !== undefined) {
    row.latitude = input.latitude;
  }
  if (input.longitude !== undefined) {
    row.longitude = input.longitude;
  }
  if (input.beds !== undefined) {
    row.beds = input.beds;
  }
  if (input.baths !== undefined) {
    row.baths = input.baths;
  }
  if (input.sqft !== undefined) {
    row.sqft = input.sqft;
  }
  if (input.propertyType !== undefined) {
    row.property_type = input.propertyType;
  }
  if (input.status !== undefined) {
    row.status = input.status;
  }
  if (input.amenities !== undefined) {
    row.amenities = input.amenities;
  }
  if (input.featuredImageUrl !== undefined) {
    row.featured_image_url = input.featuredImageUrl;
  }
  if (input.images !== undefined) {
    row.images = input.images;
  }
  if (input.soldAt !== undefined) {
    row.sold_at = input.soldAt;
  }
  return row;
}
