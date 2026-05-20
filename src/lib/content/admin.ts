import type { SiteContentKey } from "@/lib/content/keys";
import type { SiteContentPayload } from "@/lib/content/types";
import { upsertSiteContent as upsertSiteContentMemory } from "@/lib/store/memory";
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export async function upsertSiteContent<K extends SiteContentKey>(
  key: K,
  payload: SiteContentPayload<K>,
) {
  const updatedAt = new Date().toISOString();

  if (!hasSupabaseAdminConfig()) {
    const row = upsertSiteContentMemory(key, payload);
    return {
      pageKey: key,
      payload: row.payload as SiteContentPayload<K>,
      updatedAt: row.updated_at,
    };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_content")
    .upsert(
      {
        page_key: key,
        payload,
        updated_at: updatedAt,
      },
      { onConflict: "page_key" },
    )
    .select("page_key,payload,updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    pageKey: key,
    payload: data.payload as SiteContentPayload<K>,
    updatedAt: data.updated_at as string,
  };
}
