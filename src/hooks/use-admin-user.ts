"use client";

import { useEffect, useState } from "react";

import { isAdminJwtUser } from "@/lib/auth/roles";
import { isSupabaseBrowserConfigured } from "@/lib/auth/supabase-configured";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type AdminUserProfile = {
  email: string;
  firstName: string;
  lastName: string;
};

export function useAdminUser(): { loading: boolean; admin: AdminUserProfile | null } {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminUserProfile | null>(null);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setLoading(false);
      setAdmin(null);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && isAdminJwtUser(user)) {
        const meta = user.user_metadata as Record<string, unknown> | undefined;
        const firstName =
          typeof meta?.first_name === "string"
            ? meta.first_name
            : typeof meta?.firstName === "string"
              ? meta.firstName
              : "";
        const lastName =
          typeof meta?.last_name === "string"
            ? meta.last_name
            : typeof meta?.lastName === "string"
              ? meta.lastName
              : "";
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
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { loading, admin };
}
