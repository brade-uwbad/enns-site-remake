"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  AuthConfigWarning,
  AuthError,
  AuthField,
  AuthFooterLink,
  AuthHeading,
  AuthLogo,
  AuthPrimaryButton,
  RememberForgotRow,
} from "@/components/auth/auth-ui";
import { useLocalStorageValue } from "@/hooks/use-client-storage";
import { formatAuthError } from "@/lib/auth/format-auth-error";
import { isAdminJwtUser } from "@/lib/auth/roles";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const REMEMBER_EMAIL_KEY = "admin-remember-email";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rememberedEmail = useLocalStorageValue(REMEMBER_EMAIL_KEY);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberOverride, setRememberOverride] = useState<boolean | null>(null);
  const remember = rememberOverride ?? Boolean(rememberedEmail);
  const emailValue = email || rememberedEmail;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const configured = isSupabaseBrowserConfigured();
  const redirectTo = searchParams.get("redirect") ?? "/listings";
  const searchError = searchParams.get("error");
  const registered = searchParams.get("registered");
  const linkErrorMessage = searchError ? formatAuthError(searchError) : "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setMessage("Supabase is not configured for browser sign-in.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password,
      });
      if (signError) {
        setMessage(signError.message);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !isAdminJwtUser(user)) {
        await supabase.auth.signOut();
        setMessage("This account does not have admin access.");
        return;
      }
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, emailValue);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      const safeRedirect =
        redirectTo.startsWith("/admin") || redirectTo.startsWith("/listings")
          ? redirectTo
          : "/listings";
      router.replace(safeRedirect);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <AuthLogo />
      <AuthHeading title="Login" />
      {registered ? (
        <p className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          Account created. Sign in with your email and password.
        </p>
      ) : null}
      {linkErrorMessage && searchError !== "config" ? (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{linkErrorMessage}</p>
      ) : null}
      <AuthConfigWarning searchError={searchError === "config" ? searchError : null} />
      {!configured ? (
        <p className="mb-4 text-sm text-red-700">
          Add NEXT_PUBLIC Supabase URL and anon key so sign-in can run in the browser.
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          value={emailValue}
          onChange={setEmail}
          autoComplete="username"
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <RememberForgotRow
          remember={remember}
          onRememberChange={setRememberOverride}
          forgotHref="/admin/forgot-password"
        />
        <AuthError message={message} />
        <AuthPrimaryButton className="w-full" disabled={busy || !configured}>
          {busy ? "Signing in…" : "Login"}
        </AuthPrimaryButton>
      </form>
      <AuthFooterLink prompt="Don't have an account?" linkLabel="Sign up" href="/admin/register" />
    </AuthShell>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f3f4f6] text-sm text-zinc-600">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
