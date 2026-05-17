"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { AuthError, AuthHeading, AuthLogo, AuthPrimaryButton } from "@/components/auth/auth-ui";
import { useRecoveryEmail } from "@/hooks/use-recovery-email";
import { formatAuthError } from "@/lib/auth/format-auth-error";
import { getPasswordRecoveryRedirectUrl } from "@/lib/auth/recovery-redirect";
import { maskEmail } from "@/lib/auth/mask-email";
import { isSupabaseBrowserConfigured } from "@/lib/auth/supabase-configured";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordSentPage() {
  const email = useRecoveryEmail();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const configured = isSupabaseBrowserConfigured();

  async function resend() {
    if (!email || !configured) {
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
      setMessage("We sent another reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell backHref="/admin/forgot-password">
      <AuthLogo />
      <AuthHeading
        title="Password Recovery"
        subtitle={
          email
            ? `We emailed ${maskEmail(email)}. Open the message from Supabase and click Reset Password to choose a new password.`
            : "Open the reset email from Supabase and click Reset Password to choose a new password."
        }
      />
      <p className="mb-6 text-center text-sm text-zinc-600">
        The link signs you in briefly so you can set a new password. If you do not see the email, check spam.
      </p>
      <AuthError message={message} />
      <div className="flex flex-col gap-3">
        <AuthPrimaryButton
          type="button"
          className="w-full"
          disabled={busy || !email || !configured}
          onClick={() => void resend()}
        >
          {busy ? "Sending…" : "Resend email"}
        </AuthPrimaryButton>
        <Link
          href="/admin/login"
          className="text-center text-sm font-medium text-[#4a6d95] hover:underline"
        >
          Back to login
        </Link>
        <p className="text-center text-xs text-zinc-500">
          Your project uses link-based reset by default.{" "}
          <Link href="/admin/forgot-password/verify" className="text-[#4a6d95] hover:underline">
            Enter a code instead
          </Link>{" "}
          only if your Supabase email template includes one.
        </p>
      </div>
    </AuthShell>
  );
}
