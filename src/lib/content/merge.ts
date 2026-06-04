import { getDefaultSiteContent } from "@/lib/content/defaults";
import type { SiteContentKey } from "@/lib/content/keys";
import type { SiteContentPayload } from "@/lib/content/types";

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
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

  const entries = Object.entries(defaults).map(([field, fallback]) => [
    field,
    asString(raw[field], fallback),
  ]);

  return {
    ...defaults,
    ...Object.fromEntries(entries),
  } as SiteContentPayload<K>;
}
