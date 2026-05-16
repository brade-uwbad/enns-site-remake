import {
  getSupabaseAdminClient,
  getSupabaseReadClient,
  hasSupabaseAdminConfig,
  hasSupabaseReadConfig,
} from "@/lib/supabase/server";

type GeocodePoint = { latitude: number; longitude: number };

function safeNumber(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : null;
}

function postalPrefix(postalCode: string) {
  const normalized = postalCode.replace(/\s+/g, "").toUpperCase();
  return normalized.length >= 3 ? normalized.slice(0, 3) : "";
}

async function lookupCentroid(
  supabase: ReturnType<typeof getSupabaseReadClient> | ReturnType<typeof getSupabaseAdminClient>,
  prefix: string,
): Promise<{ point: GeocodePoint | null; hadError: boolean }> {
  const { data, error } = await supabase
    .from("postal_code_centroids")
    .select("latitude,longitude")
    .eq("postal_prefix", prefix)
    .maybeSingle();

  if (error) {
    return { point: null, hadError: true };
  }
  if (!data) {
    return { point: null, hadError: false };
  }

  const latitude = safeNumber((data as { latitude?: unknown }).latitude);
  const longitude = safeNumber((data as { longitude?: unknown }).longitude);
  if (latitude === null || longitude === null) {
    return { point: null, hadError: false };
  }
  return { point: { latitude, longitude }, hadError: false };
}

/**
 * Resolve an approximate point from a postal-code centroid table.
 * Returns null when lookup is unavailable or there is no match.
 */
export async function getPostalCentroid(postalCode: string): Promise<GeocodePoint | null> {
  const prefix = postalPrefix(postalCode);
  if (!prefix) {
    return null;
  }

  // Prefer service-role lookup first to avoid RLS policy issues on this helper table.
  if (hasSupabaseAdminConfig()) {
    const adminResult = await lookupCentroid(getSupabaseAdminClient(), prefix);
    if (adminResult.point) {
      return adminResult.point;
    }
  }

  if (hasSupabaseReadConfig()) {
    const readResult = await lookupCentroid(getSupabaseReadClient(), prefix);
    return readResult.point;
  }

  return null;
}

