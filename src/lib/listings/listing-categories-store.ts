import {
  DEFAULT_LISTING_CATEGORIES,
  slugifyCategory,
  titleCaseSlug,
  type ListingCategory,
} from "@/lib/listings/listing-categories";
import { getSiteSetting, setSiteSetting } from "@/lib/store/memory";
import {
  getSupabaseAdminClient,
  getSupabaseReadClient,
  hasSupabaseAdminConfig,
  hasSupabaseReadConfig,
} from "@/lib/supabase/server";

/** Key for the editable listing categories in `site_settings`. */
const LISTING_CATEGORIES_KEY = "listing_categories";

/**
 * Reads the admin-editable listing categories, falling back to the in-memory
 * store and finally the defaults when Supabase is unavailable or unset.
 */
export async function getListingCategories(): Promise<ListingCategory[]> {
  if (!hasSupabaseReadConfig()) {
    return coerceCategories(getSiteSetting(LISTING_CATEGORIES_KEY));
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", LISTING_CATEGORIES_KEY)
    .maybeSingle();

  if (error) {
    return coerceCategories(getSiteSetting(LISTING_CATEGORIES_KEY));
  }
  if (!data) {
    return DEFAULT_LISTING_CATEGORIES;
  }

  return coerceCategories(data.value);
}

/**
 * Persists the listing categories (admin only). Sanitizes each entry and
 * ensures every category has a unique, URL-safe value before saving.
 */
export async function setListingCategories(input: unknown): Promise<ListingCategory[]> {
  const categories = normalizeCategories(input);

  setSiteSetting(LISTING_CATEGORIES_KEY, categories);

  if (hasSupabaseAdminConfig()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("site_settings").upsert(
      {
        key: LISTING_CATEGORIES_KEY,
        value: categories,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (error) {
      throw new Error(error.message);
    }
  }

  return categories;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Coerces a stored JSON value into a category list, defaulting when invalid. */
function coerceCategories(value: unknown): ListingCategory[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_LISTING_CATEGORIES;
  }
  return value.map((item) => {
    const obj = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      value: asString(obj.value),
      label: asString(obj.label),
      iconGrey: asString(obj.iconGrey),
      iconBlue: asString(obj.iconBlue),
    };
  });
}

/**
 * Cleans admin input: drops blank rows, derives a slug for any category missing
 * a value, and de-duplicates values so listings map to exactly one category.
 */
function normalizeCategories(input: unknown): ListingCategory[] {
  const raw = coerceCategories(input).filter(
    (category) => category.label.trim() || category.value.trim(),
  );

  const used = new Set<string>();
  return raw.map((category) => {
    const label = category.label.trim() || titleCaseSlug(category.value.trim());
    const base = (category.value.trim() || slugifyCategory(label) || "category").toLowerCase();

    let value = base;
    let suffix = 2;
    while (used.has(value)) {
      value = `${base}-${suffix}`;
      suffix += 1;
    }
    used.add(value);

    return {
      value,
      label,
      iconGrey: category.iconGrey.trim(),
      iconBlue: category.iconBlue.trim(),
    };
  });
}
