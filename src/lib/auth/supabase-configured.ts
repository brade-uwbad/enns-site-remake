import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/public-config";

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
