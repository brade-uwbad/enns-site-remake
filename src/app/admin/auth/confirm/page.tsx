"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthHeading, AuthLogo } from "@/components/auth/auth-ui";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Client entry for password-reset links from email.
 * Handles `?code=` (PKCE) and hash tokens; server routes cannot read the hash.
 */
export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "failed">("loading");

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      setStatus("failed");
      return;
    }

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          if (!cancelled) {
            setStatus("failed");
          }
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) {
        return;
      }

      if (session) {
        router.replace("/admin/forgot-password/reset");
        return;
      }

      setStatus("failed");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "loading") {
    return (
      <AuthShell>
        <AuthLogo />
        <AuthHeading title="Password Recovery" subtitle="Confirming your reset link…" />
        <p className="text-center text-sm text-zinc-600">Please wait.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell backHref="/admin/forgot-password">
      <AuthLogo />
      <AuthHeading
        title="Password Recovery"
        subtitle="This reset link has expired or was already used. Password reset links only work for a short time and must be opened in the same browser."
      />
      <p className="text-center">
        <Link
          href="/admin/forgot-password"
          className="text-sm font-medium text-[#4a6d95] hover:underline"
        >
          Request a new reset email
        </Link>
      </p>
    </AuthShell>
  );
}
