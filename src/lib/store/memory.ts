import { randomUUID } from "crypto";
import { getDefaultSiteContent } from "@/lib/content/defaults";
import { SITE_CONTENT_KEYS, type SiteContentKey } from "@/lib/content/keys";
import type { SiteContentPayload } from "@/lib/content/types";
import type { ListQuery } from "@/lib/listings/query";
import type { ContactSubmissionRow, ListingRow, ReviewRow, ServiceRow } from "@/lib/store/types";

/** Seed `created_by` id for demo listings in the in-memory store. */
const ADMIN_USER_ID = "00000000-0000-0000-0000-000000000001";

/** @internal */
function nowIso() {
  return new Date().toISOString();
}

const seedListings: ListingRow[] = [
  {
    id: "11111111-1111-4111-8111-111111111101",
    slug: "sample-active-kitchener",
    title: "Sample active listing (Kitchener)",
    subtitle: "2 bed, 2 bath condo",
    description: "Placeholder description for MVP testing.",
    price_dollars: 750_000,
    address_line: "100 Example St",
    city: "Kitchener",
    province: "ON",
    postal_code: "N2H 0A1",
    latitude: null,
    longitude: null,
    beds: 3,
    baths: 2,
    sqft: 1800,
    property_type: "detached",
    status: "active",
    sold_at: null,
    featured_image_url: "https://placehold.co/1200x800/png?text=Listing",
    images: [],
    amenities: ["wifi", "parking", "in-unit laundry"],
    created_at: nowIso(),
    updated_at: nowIso(),
    created_by: ADMIN_USER_ID,
  },
  {
    id: "11111111-1111-4111-8111-111111111102",
    slug: "sample-sold-waterloo",
    title: "Sample sold listing (Waterloo)",
    subtitle: "Townhome in Waterloo",
    description: "Placeholder sold property.",
    price_dollars: 620_000,
    address_line: "200 Sample Ave",
    city: "Waterloo",
    province: "ON",
    postal_code: "N2L 3G1",
    latitude: null,
    longitude: null,
    beds: 2,
    baths: 2,
    sqft: 1400,
    property_type: "townhouse",
    status: "sold",
    sold_at: nowIso(),
    featured_image_url: null,
    images: [],
    amenities: ["ac/heating", "parking"],
    created_at: nowIso(),
    updated_at: nowIso(),
    created_by: ADMIN_USER_ID,
  },
];

const seedReviews: ReviewRow[] = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    title: "Honest and Genuine",
    author_name: "Karen",
    body: "We have bought and sold a couple houses with Brad and were very grateful for his honesty and genuine interest in our needs. Brad's very in-depth knowledge of local markets, professionalism and real estate expertise made the process smooth from start to finish.",
    rating: 5,
    is_visible: true,
    is_featured: true,
    display_order: 0,
    created_at: nowIso(),
  },
  {
    id: "22222222-2222-4222-8222-222222222202",
    title: "Highly Recommend Brad!",
    author_name: "Sarah",
    body: "I loved working with Brad during the sale of my townhouse. He is savvy, but not pushy. He kept my stress level down throughout the entire process, and got me an amazing deal on my house.",
    rating: 5,
    is_visible: true,
    is_featured: true,
    display_order: 1,
    created_at: nowIso(),
  },
  {
    id: "22222222-2222-4222-8222-222222222203",
    title: "Expectations Exceeded",
    author_name: "Mike & Jen",
    body: "Brad met and vastly exceeded our expectations as he navigated the journey of buying and selling our first and second homes. His guidance through a fast-moving market gave us confidence at every step.",
    rating: 5,
    is_visible: true,
    is_featured: true,
    display_order: 2,
    created_at: nowIso(),
  },
  {
    id: "22222222-2222-4222-8222-222222222204",
    title: "Great Local Knowledge",
    author_name: "Alex P.",
    body: "Brad was responsive and clear through the whole process. Would work with him again without hesitation.",
    rating: 5,
    is_visible: true,
    is_featured: false,
    display_order: 0,
    created_at: nowIso(),
  },
];

const seedServices: ServiceRow[] = [
  {
    id: "33333333-3333-4333-8333-333333333301",
    slug: "buying",
    title: "Buying a home",
    description: "Search strategy, offer guidance, and closing support.",
    body: null,
    sort_order: 1,
  },
  {
    id: "33333333-3333-4333-8333-333333333302",
    slug: "selling",
    title: "Selling your home",
    description: "Pricing, staging tips, marketing, and negotiation.",
    body: null,
    sort_order: 2,
  },
  {
    id: "33333333-3333-4333-8333-333333333303",
    slug: "appraisal",
    title: "Home appraisal",
    description: "Context on value drivers and what to expect from an appraisal.",
    body: null,
    sort_order: 3,
  },
];

let listings = [...seedListings];
let reviews = [...seedReviews];
const services = [...seedServices];
const siteContent: Record<
  SiteContentKey,
  { payload: SiteContentPayload<SiteContentKey>; updated_at: string }
> = Object.fromEntries(
  SITE_CONTENT_KEYS.map((key) => [
    key,
    { payload: getDefaultSiteContent(key), updated_at: nowIso() },
  ]),
) as Record<SiteContentKey, { payload: SiteContentPayload<SiteContentKey>; updated_at: string }>;
let contactSubmissions: ContactSubmissionRow[] = [];

/**
 * @internal
 * Case-insensitive match on listing title and city for the `q` search parameter.
 */
function matchesSearch(row: ListingRow, q: string) {
  const inner = q
    .replace(/[%_\\]/g, "")
    .replace(/,/g, " ")
    .trim()
    .toLowerCase();
  if (!inner) {
    return true;
  }
  const t = row.title.toLowerCase();
  const c = (row.city ?? "").toLowerCase();
  return t.includes(inner) || c.includes(inner);
}

/**
 * Lists and filters in-memory listings by status, then paginates.
 *
 * @param status - `"active"` or `"sold"`; draft listings are excluded from public list flows.
 * @param query - Pagination (`page`, `limit`) and optional filters / full-text-ish `q`.
 * @returns Matching `items` for the current page and `total` matching rows before slicing.
 */
export function queryListings(status: "active" | "sold", query: ListQuery) {
  let rows = listings.filter((l) => l.status === status);

  const minPrice = query.minPrice;
  const maxPrice = query.maxPrice;
  const beds = query.beds;
  if (minPrice !== undefined) {
    rows = rows.filter((l) => (l.price_dollars ?? 0) >= minPrice);
  }
  if (maxPrice !== undefined) {
    rows = rows.filter((l) => (l.price_dollars ?? 0) <= maxPrice);
  }
  if (beds !== undefined) {
    rows = rows.filter((l) => l.beds === beds);
  }
  if (query.propertyType) {
    rows = rows.filter((l) => l.property_type === query.propertyType);
  }
  if (query.city?.trim()) {
    const c = query.city
      .replace(/[%_\\]/g, "")
      .replace(/,/g, " ")
      .trim()
      .toLowerCase();
    if (c) {
      rows = rows.filter((l) => (l.city ?? "").toLowerCase().includes(c));
    }
  }
  const search = query.q?.trim();
  if (search) {
    rows = rows.filter((l) => matchesSearch(l, search));
  }

  rows.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));

  const total = rows.length;
  const from = (query.page - 1) * query.limit;
  const slice = rows.slice(from, from + query.limit);
  return { items: slice, total };
}

/**
 * @param id - Listing UUID.
 * @returns The listing row, or `null` if none exists.
 */
export function getListingById(id: string): ListingRow | null {
  return listings.find((l) => l.id === id) ?? null;
}

/**
 * Creates a listing with a generated id and timestamps, prepending it to the in-memory list.
 *
 * @param row - Listing fields without server-generated `id`, `created_at`, or `updated_at`.
 * @returns The persisted listing including id and timestamps.
 */
export function insertListing(
  row: Omit<ListingRow, "id" | "created_at" | "updated_at">,
): ListingRow {
  const id = randomUUID();
  const ts = nowIso();
  const full: ListingRow = {
    ...row,
    id,
    created_at: ts,
    updated_at: ts,
  };
  listings = [full, ...listings];
  return full;
}

/**
 * Merges `patch` into an existing listing and refreshes `updated_at`.
 *
 * @param id - Listing UUID.
 * @param patch - Partial listing fields to merge.
 * @returns The updated listing, or `null` if no row exists for `id`.
 */
export function updateListingById(id: string, patch: Partial<ListingRow>): ListingRow | null {
  const idx = listings.findIndex((l) => l.id === id);
  if (idx === -1) {
    return null;
  }
  const next = { ...listings[idx], ...patch, updated_at: nowIso() } as ListingRow;
  listings = [...listings.slice(0, idx), next, ...listings.slice(idx + 1)];
  return next;
}

/**
 * @param id - Listing UUID.
 * @returns `true` if a row was removed, otherwise `false`.
 */
export function deleteListingById(id: string): boolean {
  const before = listings.length;
  listings = listings.filter((l) => l.id !== id);
  return listings.length < before;
}

/**
 * @returns All reviews sorted newest-first (by `created_at`).
 */
export function listReviews(): ReviewRow[] {
  return [...reviews].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

/** All reviews for admin (featured first, then display order). */
export function listAllReviews(): ReviewRow[] {
  return [...reviews].sort((a, b) => {
    if (a.is_featured !== b.is_featured) {
      return a.is_featured ? -1 : 1;
    }
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    return a.created_at < b.created_at ? 1 : -1;
  });
}

/** Featured, visible reviews for the About page. */
export function listFeaturedReviews(limit: number): ReviewRow[] {
  return reviews
    .filter((r) => r.is_visible && r.is_featured)
    .sort((a, b) => {
      if (a.display_order !== b.display_order) {
        return a.display_order - b.display_order;
      }
      return a.created_at < b.created_at ? 1 : -1;
    })
    .slice(0, limit);
}

export function countFeaturedReviews(excludeId?: string): number {
  return reviews.filter((r) => r.is_featured && r.is_visible && r.id !== excludeId).length;
}

/**
 * @param row - Review fields without `id` or `created_at`.
 * @returns The stored review including generated id and timestamp.
 */
export function insertReview(row: Omit<ReviewRow, "id" | "created_at">): ReviewRow {
  const id = randomUUID();
  const full: ReviewRow = { ...row, id, created_at: nowIso() };
  reviews = [full, ...reviews];
  return full;
}

export function updateReviewById(
  id: string,
  patch: Partial<Omit<ReviewRow, "id" | "created_at">>,
): ReviewRow | null {
  const index = reviews.findIndex((r) => r.id === id);
  if (index < 0) {
    return null;
  }
  const next = { ...reviews[index], ...patch };
  if (!next.is_visible) {
    next.is_featured = false;
  }
  reviews = [...reviews.slice(0, index), next, ...reviews.slice(index + 1)];
  return next;
}

/**
 * @param id - Review UUID.
 * @returns `true` if a review was removed.
 */
export function deleteReviewById(id: string): boolean {
  const before = reviews.length;
  reviews = reviews.filter((r) => r.id !== id);
  return reviews.length < before;
}

/**
 * @returns Static service rows sorted by `sort_order`.
 */
export function listServices(): ServiceRow[] {
  return [...services].sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * @returns Payload and `updated_at` for CMS-style content, or `undefined` if missing.
 */
export function getSiteContent<K extends SiteContentKey>(key: K) {
  return siteContent[key] as { payload: SiteContentPayload<K>; updated_at: string } | undefined;
}

export function upsertSiteContent<K extends SiteContentKey>(
  key: K,
  payload: SiteContentPayload<K>,
) {
  const row = {
    payload,
    updated_at: nowIso(),
  };
  siteContent[key] = row as (typeof siteContent)[K];
  return siteContent[key] as { payload: SiteContentPayload<K>; updated_at: string };
}

/**
 * Stores a contact or valuation submission in memory with a generated id and timestamp.
 *
 * @param input - Fields except `id` and `created_at`.
 * @returns The persisted submission row.
 */
export function addContactSubmission(
  input: Omit<ContactSubmissionRow, "id" | "created_at">,
): ContactSubmissionRow {
  const row: ContactSubmissionRow = {
    ...input,
    id: randomUUID(),
    created_at: nowIso(),
  };
  contactSubmissions = [row, ...contactSubmissions];
  return row;
}

/**
 * Latest contact or valuation submissions for the admin dashboard.
 */
export function listRecentContactSubmissions(limit = 10): ContactSubmissionRow[] {
  return contactSubmissions.slice(0, Math.max(1, limit));
}

/** Counts listings in the in-memory store by status (for admin dashboard). */
export function countListingsByStatus() {
  const active = listings.filter((l) => l.status === "active").length;
  const sold = listings.filter((l) => l.status === "sold").length;
  return { active, sold, total: active + sold };
}

export { ADMIN_USER_ID };
