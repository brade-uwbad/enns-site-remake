"use client";

import Link from "next/link";
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
import { useRecoveryEmail } from "@/hooks/use-recovery-email";
import { formatAuthError } from "@/lib/auth/format-auth-error";
import { getPasswordRecoveryRedirectUrl } from "@/lib/auth/recovery-redirect";
import { maskEmail } from "@/lib/auth/mask-email";
import { setRecoveryEmail } from "@/lib/auth/recovery-storage";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordVerifyPage() {
  const router = useRouter();
  const recoveryEmail = useRecoveryEmail();
  const [manualEmail, setManualEmail] = useState("");
  const email = recoveryEmail || manualEmail;
  const [code, setCode] = useState("");
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
      setMessage("We sent another reset email. Use the link in that message, or a code if your template includes one.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setMessage("Supabase is not configured.");
      return;
    }
    if (!email) {
      setMessage("Enter your email on the previous step first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code.trim(),
        type: "recovery",
      });
      if (error) {
        setMessage(formatAuthError(error.message));
        return;
      }
      setRecoveryEmail(email);
      router.push("/admin/forgot-password/reset");
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
            ? `If your Supabase email includes a numeric code for ${maskEmail(email)}, enter it below. Most projects only send a reset link — use that link from your inbox instead.`
            : "Only use this page if your reset email includes a numeric code (not the default Supabase template)."
        }
      />
      <p className="mb-4 text-center text-sm text-zinc-600">
        <Link href="/admin/forgot-password/sent" className="text-[#4a6d95] hover:underline">
          I received a reset link in my email
        </Link>
      </p>
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        {!recoveryEmail ? (
          <AuthField
            id="recover-email-verify"
            label="Email"
            type="email"
            value={manualEmail}
            onChange={setManualEmail}
            autoComplete="email"
          />
        ) : null}
        <AuthField
          id="recover-code"
          label="Verification code"
          value={code}
          onChange={setCode}
          autoComplete="one-time-code"
          placeholder="Verification code"
        />
        <AuthError message={message} />
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => void resend()}
            disabled={busy || !email}
            className="text-sm text-[#4a6d95] hover:underline disabled:opacity-50"
          >
            Resend code
          </button>
          <AuthPrimaryButton className="min-w-[7rem]" disabled={busy || !configured}>
            {busy ? "Verifying…" : "Next"}
          </AuthPrimaryButton>
        </div>
      </form>
      {!email ? (
        <p className="mt-4 text-center text-sm text-zinc-600">
          <Link href="/admin/forgot-password" className="text-[#4a6d95] hover:underline">
            Enter your email
          </Link>
        </p>
      ) : null}
    </AuthShell>
  );
}
