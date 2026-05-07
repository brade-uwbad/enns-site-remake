type GeocodePoint = { latitude: number; longitude: number };

function safeNumber(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : null;
}

export function buildGeocodeAddress(parts: {
  addressLine?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
}) {
  return [parts.addressLine, parts.city, parts.province, parts.postalCode]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

/**
 * Geocode a listing address using Google Geocoding API.
 * Returns null when key is missing, response is empty, or data is invalid.
 */
export async function geocodeAddress(address: string): Promise<GeocodePoint | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey || !address.trim()) {
    return null;
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address,
  )}&key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    return null;
  }

  const body = (await res.json()) as {
    status?: string;
    results?: Array<{ geometry?: { location?: { lat?: number | string; lng?: number | string } } }>;
  };

  if (body.status !== "OK" || !Array.isArray(body.results) || body.results.length === 0) {
    return null;
  }

  const loc = body.results[0]?.geometry?.location;
  const latitude = safeNumber(loc?.lat);
  const longitude = safeNumber(loc?.lng);
  if (latitude === null || longitude === null) {
    return null;
  }
  return { latitude, longitude };
}
