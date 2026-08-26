import { getSiteSetting, setSiteSetting } from "@/lib/store/memory";
import {
  getSupabaseAdminClient,
  getSupabaseReadClient,
  hasSupabaseAdminConfig,
  hasSupabaseReadConfig,
} from "@/lib/supabase/server";

/** Key for the "show More listings nearby" flag in `site_settings`. */
const SHOW_NEARBY_LISTINGS_KEY = "show_nearby_listings";

/** Nearby listings are shown by default when the flag has never been set. */
const DEFAULT_SHOW_NEARBY_LISTINGS = true;

/**
 * Whether the "More listings nearby" section should render on listing detail
 * pages. Reads from `site_settings`, falling back to the in-memory store (and a
 * sensible default) when Supabase is unavailable.
 */
export async function getShowNearbyListings(): Promise<boolean> {
  if (!hasSupabaseReadConfig()) {
    return coerceFlag(getSiteSetting(SHOW_NEARBY_LISTINGS_KEY));
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", SHOW_NEARBY_LISTINGS_KEY)
    .maybeSingle();

  if (error) {
    return coerceFlag(getSiteSetting(SHOW_NEARBY_LISTINGS_KEY));
  }

  if (!data) {
    return DEFAULT_SHOW_NEARBY_LISTINGS;
  }

  return coerceFlag(data.value);
}

/**
 * Persists the "More listings nearby" flag. Writes through the service-role
 * admin client, falling back to the in-memory store when Supabase is
 * unavailable.
 */
export async function setShowNearbyListings(enabled: boolean): Promise<void> {
  setSiteSetting(SHOW_NEARBY_LISTINGS_KEY, enabled);

  if (!hasSupabaseAdminConfig()) {
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: SHOW_NEARBY_LISTINGS_KEY,
      value: enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

/** Coerces a stored JSON value to a boolean, defaulting when unset. */
function coerceFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return DEFAULT_SHOW_NEARBY_LISTINGS;
}
