import { getDefaultSiteContent } from "@/lib/content/defaults";
import type { SiteContentKey } from "@/lib/content/keys";
import type { SiteContentPayload } from "@/lib/content/types";

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

/** Coerces a stored service-card entry into a fully-populated card. */
function sanitizeServiceCard(item: unknown) {
  const obj = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  return {
    title: asString(obj.title, ""),
    body: asString(obj.body, ""),
    iconUrl: asString(obj.iconUrl, ""),
  };
}

/**
 * Bridges the pre-list services payload (fixed appraisal/buying/selling fields)
 * into the new card array so existing content isn't lost on first load. Returns
 * null when no legacy content is present.
 */
function legacyServiceCards(raw: Record<string, unknown>) {
  const legacy: [string, string, string][] = [
    ["appraisalTitle", "appraisalBody", "/icons/appraisal.svg"],
    ["buyingTitle", "buyingBody", "/icons/buying.svg"],
    ["sellingTitle", "sellingBody", "/icons/selling.svg"],
  ];

  const cards = legacy
    .map(([titleKey, bodyKey, iconUrl]) => ({
      title: asString(raw[titleKey], ""),
      body: asString(raw[bodyKey], ""),
      iconUrl,
    }))
    .filter((card) => card.title || card.body);

  return cards.length > 0 ? cards : null;
}

/** Merges a stored JSON payload with typed defaults so public pages always have full objects. */
export function mergeSiteContentPayload<K extends SiteContentKey>(
  key: K,
  raw: Record<string, unknown> | null | undefined,
): SiteContentPayload<K> {
  const defaults = getDefaultSiteContent(key);

  if (!raw) {
    return defaults;
  }

  const entries = Object.entries(defaults).map(([field, fallback]) => {
    const value = raw[field];

    if (typeof fallback === "string") {
      return [field, asString(value, fallback)];
    }

    // The services page stores a variable-length list of cards.
    if (field === "services") {
      if (Array.isArray(value)) {
        return [field, value.map(sanitizeServiceCard)];
      }
      return [field, legacyServiceCards(raw) ?? fallback];
    }

    return [field, value ?? fallback];
  });

  return {
    ...defaults,
    ...Object.fromEntries(entries),
  } as SiteContentPayload<K>;
}
