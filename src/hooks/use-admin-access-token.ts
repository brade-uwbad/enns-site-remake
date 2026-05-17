"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/public-config";

/**
 * Current Supabase access token for `Authorization: Bearer` on admin APIs.
 * Null while loading or when public Supabase env is not configured in the browser.
 */
export function useAdminAccessToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
      return;
    }

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setToken(data.session?.access_token ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return token;
}
