"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Supabase sometimes redirects email links to the site root with `?error=` or `?code=`.
 * Forward those to the admin auth routes so users see a useful page.
 */
export function AuthLandingRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") {
      return;
    }

    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash.startsWith("#")
      ? new URLSearchParams(window.location.hash.slice(1))
      : null;

    const error = search.get("error") ?? hash?.get("error");
    const errorCode = search.get("error_code") ?? hash?.get("error_code");
    const code = search.get("code");

    if (code) {
      router.replace(`/admin/auth/callback?code=${encodeURIComponent(code)}&next=/listings`);
      return;
    }

    if (error || errorCode) {
      const params = new URLSearchParams();
      if (errorCode) {
        params.set("error", errorCode);
      } else if (error) {
        params.set("error", error);
      }
      router.replace(`/admin/login?${params.toString()}`);
    }
  }, [pathname, router]);

  return null;
}
