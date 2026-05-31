import { getDefaultSiteContent } from "@/lib/content/defaults";
import type { SiteContentKey } from "@/lib/content/keys";
import { mergeSiteContentPayload } from "@/lib/content/merge";
import type { SiteContentRow } from "@/lib/content/types";
import { getSiteContent } from "@/lib/store/memory";
import { getSupabaseReadClient, hasSupabaseReadConfig } from "@/lib/supabase/server";

export async function fetchSiteContent<K extends SiteContentKey>(key: K): Promise<SiteContentRow<K>> {
  const defaults = getDefaultSiteContent(key);

  if (!hasSupabaseReadConfig()) {
    const row = getSiteContent(key);
    return {
      pageKey: key,
      payload: mergeSiteContentPayload(key, row?.payload),
      updatedAt: row?.updated_at ?? null,
    };
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("site_content")
    .select("page_key,payload,updated_at")
    .eq("page_key", key)
    .maybeSingle();

  if (error) {
    const row = getSiteContent(key);
    return {
      pageKey: key,
      payload: mergeSiteContentPayload(key, row?.payload),
      updatedAt: row?.updated_at ?? null,
    };
  }

  const rawPayload =
    data && typeof data.payload === "object" && data.payload !== null
      ? (data.payload as Record<string, unknown>)
      : undefined;

  return {
    pageKey: key,
    payload: mergeSiteContentPayload(key, rawPayload ?? defaults),
    updatedAt: typeof data?.updated_at === "string" ? data.updated_at : null,
  };
}
