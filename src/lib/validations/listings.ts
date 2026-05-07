import { z } from "zod";

const imageUrl = z.string().url().max(2000);

/**
 * Request body for `POST /api/admin/listings` (camelCase; mapped to snake_case listing fields server-side).
 */
export const listingCreateSchema = z.object({
  title: z.string().min(1).max(500),
  subtitle: z.string().max(500).optional().nullable(),
  slug: z.string().min(1).max(200).optional().nullable(),
  description: z.string().max(50000).optional().nullable(),
  priceDollars: z.number().min(0).finite().optional().nullable(),
  addressLine: z.string().max(300).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  province: z.string().max(80).optional().nullable(),
  postalCode: z.string().min(1).max(20),
  latitude: z.number().min(-90).max(90).finite().optional().nullable(),
  longitude: z.number().min(-180).max(180).finite().optional().nullable(),
  beds: z.number().int().min(0).optional().nullable(),
  baths: z.number().min(0).optional().nullable(),
  sqft: z.number().int().min(0).optional().nullable(),
  propertyType: z.enum(["apartment", "detached", "townhouse", "condo"]).optional().nullable(),
  status: z.enum(["active", "sold", "draft"]).default("draft"),
  amenities: z.array(z.string().min(1).max(120)).max(100).optional(),
  featuredImageUrl: imageUrl.optional().nullable(),
  images: z.array(imageUrl).max(50).optional(),
});

/**
 * Request body for `PUT /api/admin/listings/[id]`; all fields optional; may include `soldAt` when marking sold.
 */
export const listingUpdateSchema = listingCreateSchema.partial().extend({
  soldAt: z.string().datetime().optional().nullable(),
});

/** Inferred type from {@link listingCreateSchema}. */
export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
/** Inferred type from {@link listingUpdateSchema}. */
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
