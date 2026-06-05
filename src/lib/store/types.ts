/** Row shapes for the in-memory store (aligned with future Supabase tables). */

/** Publication state for a listing in the store or database. */
export type ListingStatus = "active" | "sold" | "draft";

/** Categorization of a listing by built form. */
export type PropertyType = "apartment" | "detached" | "townhouse" | "condo";

/** Allowed values for {@link PropertyType}, suitable for `<select>` options. */
export const PROPERTY_TYPES: PropertyType[] = [
  "apartment",
  "detached",
  "townhouse",
  "condo",
];

/**
 * Property listing record: pricing, address, media, and lifecycle fields.
 *
 * @remarks
 * `price_dollars` is stored as Postgres `numeric(12,2)`; timestamps are ISO 8601 strings.
 */
export type ListingRow = {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  price_dollars: number | null;
  address_line: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: PropertyType | null;
  status: ListingStatus;
  sold_at: string | null;
  featured_image_url: string | null;
  images: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

/** Client testimonial; featured rows appear on the About page (up to 3). */
export type ReviewRow = {
  id: string;
  title: string;
  author_name: string;
  body: string;
  rating: number | null;
  is_visible: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
};

/** Service offering (buying, selling, appraisal) with optional long-form `body`. */
export type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body: string | null;
  sort_order: number;
};

/** Keys for CMS-style JSON blobs in `site_content`. */
export type { SiteContentKey } from "@/lib/content/keys";

/** Persisted contact or valuation form submission. */
export type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: "contact" | "valuation";
  created_at: string;
};
