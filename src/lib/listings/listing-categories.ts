/**
 * Listing categories (formerly the hard-coded "property type" enum) are now
 * admin-editable. This module holds the pure, client-safe pieces: the shape, the
 * defaults, and label/slug helpers. Server-side reads/writes live in
 * `listing-categories-store.ts` so this file stays free of server-only imports.
 */

export type ListingCategory = {
  /** Stable slug stored on `listings.property_type`. */
  value: string;
  /** Display name shown in filters, cards, and the picker. */
  label: string;
  /** Icon shown when the category is not selected (URL or path). Empty = none. */
  iconGrey: string;
  /** Icon shown when the category is selected (URL or path). Empty = none. */
  iconBlue: string;
};

/**
 * Seeded categories used when none have been saved yet. "Leases" replaces the
 * old apartment + condo categories.
 */
export const DEFAULT_LISTING_CATEGORIES: ListingCategory[] = [
  {
    value: "leases",
    label: "Leases",
    iconGrey: "/icons/house_grey.png",
    iconBlue: "/icons/house_blue.png",
  },
  {
    value: "detached",
    label: "Detached",
    iconGrey: "/icons/detached_grey.png",
    iconBlue: "/icons/detached_blue.png",
  },
  {
    value: "townhouse",
    label: "Townhouse",
    iconGrey: "/icons/townhouse_grey.png",
    iconBlue: "/icons/townhouse_blue.png",
  },
];

/** Turns a category value/slug into a readable label (e.g. "leases" → "Leases"). */
export function titleCaseSlug(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Resolves a stored category value to its display label, falling back to a
 * title-cased slug when the value isn't in the current category list (e.g. an
 * older/removed category still stored on a listing).
 */
export function labelForCategory(
  categories: ListingCategory[],
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }
  const match = categories.find((category) => category.value === value);
  return match ? match.label : titleCaseSlug(value);
}

/** Converts a label into a URL-safe slug for use as a category value. */
export function slugifyCategory(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
