"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isAdminJwtUser } from "@/lib/auth/roles";
import { isSupabaseBrowserConfigured } from "@/lib/auth/supabase-configured";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdminSessionGuardProps = {
  children: React.ReactNode;
  /** Set false when `ADMIN_UI_BYPASS_AUTH` is enabled for local dev. */
  enabled?: boolean;
};

/**
 * Client-side check: redirects to login if there is no admin Supabase session.
 * Middleware and the dashboard layout already enforce this on the server.
 */
export function AdminSessionGuard({ children, enabled = true }: AdminSessionGuardProps) {
  if (!enabled) {
    return children;
  }
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/admin/login?error=config");
      return;
    }

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) {
        return;
      }
      if (!user || !isAdminJwtUser(user)) {
        const redirect = encodeURIComponent(pathname);
        router.replace(`/admin/login?redirect=${redirect}`);
        return;
      }
      setAllowed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center bg-slate-50 text-sm text-zinc-600">
        Checking sign-in…
      </div>
    );
  }

  return children;
}
