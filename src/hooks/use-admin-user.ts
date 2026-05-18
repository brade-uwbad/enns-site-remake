"use client";

import { useEffect, useState } from "react";

import { isAdminJwtUser } from "@/lib/auth/roles";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminUserProfile = {
  email: string;
  firstName: string;
  lastName: string;
};

/**
 * Admin session profile and access token for client-side admin API calls.
 */
export function useAdminUser(): {
  loading: boolean;
  admin: AdminUserProfile | null;
  accessToken: string | null;
} {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminUserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      queueMicrotask(() => {
        setLoading(false);
        setAdmin(null);
        setAccessToken(null);
      });
      return;
    }

    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setAccessToken(session?.access_token ?? null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && isAdminJwtUser(user)) {
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        const firstName = typeof meta?.first_name === "string" ? meta.first_name : "";
        const lastName = typeof meta?.last_name === "string" ? meta.last_name : "";
        setAdmin({
          email: user.email ?? "",
          firstName,
          lastName,
        });
      } else {
        setAdmin(null);
      }
      setLoading(false);
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null);
      void load();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { loading, admin, accessToken };
}
