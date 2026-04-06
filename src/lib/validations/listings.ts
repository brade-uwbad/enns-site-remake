import { z } from "zod";

const imageUrl = z.string().url().max(2000);

/**
 * Request body for `POST /api/admin/listings` (camelCase; mapped to snake_case listing fields server-side).
 */
export const listingCreateSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(200).optional().nullable(),
  description: z.string().max(50000).optional().nullable(),
  priceCents: z.number().int().min(0).optional().nullable(),
  addressLine1: z.string().max(300).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  province: z.string().max(80).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  beds: z.number().int().min(0).optional().nullable(),
  baths: z.number().min(0).optional().nullable(),
  sqft: z.number().int().min(0).optional().nullable(),
  status: z.enum(["active", "sold", "draft"]).default("draft"),
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
