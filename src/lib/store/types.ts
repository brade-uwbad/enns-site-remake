/** Row shapes for the in-memory store (aligned with future Supabase tables). */

/** Publication state for a listing in the store or database. */
export type ListingStatus = "active" | "sold" | "draft";

/**
 * Property listing record: pricing, address, media, and lifecycle fields.
 *
 * @remarks
 * `price_cents` avoids floating-point money; timestamps are ISO 8601 strings.
 */
export type ListingRow = {
  id: string;
  slug: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  price_cents: number | null;
  address_line1: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  status: ListingStatus;
  sold_at: string | null;
  featured_image_url: string | null;
  images: string[];
  amenities: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

/** Client testimonial stored for public display when `is_visible` is true. */
export type ReviewRow = {
  id: string;
  author_name: string;
  body: string;
  rating: number | null;
  is_visible: boolean;
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
export type SiteContentKey = "homepage" | "about";

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
