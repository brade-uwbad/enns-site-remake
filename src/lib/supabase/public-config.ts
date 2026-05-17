/**
 * Supabase URL and anon (publishable) key for browser and edge middleware.
 * Client bundles only include `NEXT_PUBLIC_*`; server/middleware may fall back to `STORAGE_*`.
 */
export function getSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.STORAGE_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL
  );
}

export function getSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.STORAGE_SUPABASE_ANON_KEY ??
    process.env.STORAGE_SUPABASE_PUBLISHABLE_KEY
  );
}

export function hasSupabaseSessionConfig(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
