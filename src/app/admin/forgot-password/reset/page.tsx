"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthError,
  AuthField,
  AuthHeading,
  AuthLogo,
  AuthPrimaryButton,
  PasswordRequirements,
} from "@/components/auth/auth-ui";
import { formatAuthError } from "@/lib/auth/format-auth-error";
import { checkPassword } from "@/lib/auth/password";
import { clearRecoveryEmail } from "@/lib/auth/recovery-storage";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ForgotPasswordResetPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const configured = isSupabaseBrowserConfigured();
  const [sessionState, setSessionState] = useState<"checking" | "ready" | "missing">(
    configured ? "checking" : "missing",
  );
  const passwordChecks = checkPassword(password);

  useEffect(() => {
    if (!configured) {
      return;
    }

    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState({}, "", "/admin/forgot-password/reset");
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        setSessionState(session ? "ready" : "missing");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [configured]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setMessage("Supabase is not configured.");
      return;
    }
    if (sessionState !== "ready") {
      setMessage(formatAuthError("Auth session missing!"));
      return;
    }
    if (!passwordChecks.valid) {
      setMessage("Password does not meet the requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setSessionState("missing");
        setMessage(formatAuthError("Auth session missing!"));
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(formatAuthError(error.message));
        if (error.message.toLowerCase().includes("session")) {
          setSessionState("missing");
        }
        return;
      }
      clearRecoveryEmail();
      router.push("/admin/forgot-password/success");
    } finally {
      setBusy(false);
    }
  }

  if (sessionState === "checking") {
    return (
      <AuthShell backHref="/admin/forgot-password">
        <AuthLogo />
        <AuthHeading title="Password Recovery" subtitle="Checking your reset session…" />
        <p className="text-center text-sm text-zinc-600">Please wait.</p>
      </AuthShell>
    );
  }

  if (sessionState === "missing") {
    return (
      <AuthShell backHref="/admin/forgot-password">
        <AuthLogo />
        <AuthHeading
          title="Password Recovery"
          subtitle="This reset link has expired or was already used. Request a new email and open the newest Reset Password link soon after it arrives."
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

  return (
    <AuthShell backHref="/admin/forgot-password">
      <AuthLogo />
      <AuthHeading title="Password Recovery" subtitle="Choose a new password for your account" />
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <AuthField
            id="new-password"
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
          />
          <PasswordRequirements password={password} />
        </div>
        <AuthField
          id="confirm-new-password"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        <AuthError message={message} />
        <AuthPrimaryButton className="w-full" disabled={busy || !configured}>
          {busy ? "Saving…" : "Next"}
        </AuthPrimaryButton>
      </form>
    </AuthShell>
  );
}
