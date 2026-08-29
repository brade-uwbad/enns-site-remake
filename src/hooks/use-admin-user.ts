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

function profileFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): AdminUserProfile {
  const meta = user.user_metadata;
  const firstName = typeof meta?.first_name === "string" ? meta.first_name : "";
  const lastName = typeof meta?.last_name === "string" ? meta.last_name : "";
  return {
    email: user.email ?? "",
    firstName,
    lastName,
  };
}

/**
 * Admin session profile and access token for client-side admin API calls.
 * Uses `getSession()` only — avoid `getUser()` here because it races server auth
 * and can invalidate the refresh token ("Session not found" in Supabase logs).
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

    function applySession(session: { access_token?: string; user?: { email?: string | null; user_metadata?: Record<string, unknown> } } | null) {
      setAccessToken(session?.access_token ?? null);
      const user = session?.user;
      if (user && isAdminJwtUser(user)) {
        setAdmin(profileFromUser(user));
      } else {
        setAdmin(null);
      }
      setLoading(false);
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { loading, admin, accessToken };
}
