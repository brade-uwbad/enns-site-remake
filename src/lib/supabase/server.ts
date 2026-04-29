import { createClient } from "@supabase/supabase-js";

/**
 * Reads Supabase env vars, preferring new key names and falling back to legacy names.
 */
function readSupabaseEnv() {
  const url = process.env.STORAGE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.STORAGE_SUPABASE_PUBLISHABLE_KEY ??
    process.env.STORAGE_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey =
    process.env.STORAGE_SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  return { url, publishableKey, secretKey };
}

export function hasSupabaseReadConfig() {
  const { url, publishableKey } = readSupabaseEnv();
  return Boolean(url && publishableKey);
}

export function hasSupabaseAdminConfig() {
  const { url, secretKey } = readSupabaseEnv();
  return Boolean(url && secretKey);
}

export function getSupabaseReadClient() {
  const { url, publishableKey } = readSupabaseEnv();
  if (!url || !publishableKey) {
    throw new Error(
      "Supabase read config missing. Set STORAGE_SUPABASE_URL and STORAGE_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return createClient(url, publishableKey);
}

export function getSupabaseAdminClient() {
  const { url, secretKey } = readSupabaseEnv();
  if (!url || !secretKey) {
    throw new Error(
      "Supabase admin config missing. Set STORAGE_SUPABASE_URL and STORAGE_SUPABASE_SECRET_KEY.",
    );
  }
  return createClient(url, secretKey);
}
