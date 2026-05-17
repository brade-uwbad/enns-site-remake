"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthError,
  AuthField,
  AuthHeading,
  AuthLogo,
  AuthPrimaryButton,
} from "@/components/auth/auth-ui";
import { formatAuthError } from "@/lib/auth/format-auth-error";
import { getPasswordRecoveryRedirectUrl } from "@/lib/auth/recovery-redirect";
import { setRecoveryEmail } from "@/lib/auth/recovery-storage";
import { isSupabaseBrowserConfigured } from "@/lib/auth/supabase-configured";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const configured = isSupabaseBrowserConfigured();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setMessage("Supabase is not configured.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = getPasswordRecoveryRedirectUrl(window.location.origin);
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setMessage(formatAuthError(error.message));
        return;
      }
      setRecoveryEmail(email);
      router.push("/admin/forgot-password/sent");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <AuthLogo />
      <AuthHeading
        title="Password Recovery"
        subtitle="Enter your email and we'll send you a link to reset your password"
      />
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <AuthField
          id="recover-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <AuthError message={message} />
        <AuthPrimaryButton className="w-full" disabled={busy || !configured}>
          {busy ? "Sending…" : "Next"}
        </AuthPrimaryButton>
      </form>
    </AuthShell>
  );
}
