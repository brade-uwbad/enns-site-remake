"use client";



import Link from "next/link";

import { useRouter } from "next/navigation";

import { useState } from "react";



import { AuthShell } from "@/components/auth/auth-shell";

import {

  AuthError,

  AuthField,

  AuthFooterLink,

  AuthHeading,

  AuthLogo,

  AuthPrimaryButton,

  PasswordRequirements,

} from "@/components/auth/auth-ui";

import { formatAuthError } from "@/lib/auth/format-auth-error";

import { checkPassword } from "@/lib/auth/password";



export default function AdminRegisterPage() {

  const router = useRouter();

  const [firstName, setFirstName] = useState("");

  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [busy, setBusy] = useState(false);

  const [message, setMessage] = useState("");



  const passwordChecks = checkPassword(password);



  async function onSubmit(e: React.FormEvent) {

    e.preventDefault();

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

      const res = await fetch("/api/admin/auth/register", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          email,

          password,

          firstName: firstName.trim(),

          lastName: lastName.trim(),

        }),

      });

      const data = await res.json();

      if (!res.ok) {

        setMessage(formatAuthError(data?.error?.message ?? "Could not create account."));

        return;

      }

      router.push("/admin/login?registered=1");

    } finally {

      setBusy(false);

    }

  }



  return (

    <AuthShell>

      <AuthLogo />

      <AuthHeading title="Welcome to Enns Real Estate" />

      <form className="space-y-4" onSubmit={(e) => void onSubmit(e)}>

        <div className="grid grid-cols-2 gap-3">

          <AuthField

            id="register-first"

            label="First name"

            value={firstName}

            onChange={setFirstName}

            autoComplete="given-name"

          />

          <AuthField

            id="register-last"

            label="Last name"

            value={lastName}

            onChange={setLastName}

            autoComplete="family-name"

          />

        </div>

        <AuthField

          id="register-email"

          label="Email"

          type="email"

          value={email}

          onChange={setEmail}

          autoComplete="email"

        />

        <div>

          <AuthField

            id="register-password"

            label="Password"

            type="password"

            value={password}

            onChange={setPassword}

            autoComplete="new-password"

          />

          <PasswordRequirements password={password} />

        </div>

        <AuthField

          id="register-confirm"

          label="Confirm password"

          type="password"

          value={confirmPassword}

          onChange={setConfirmPassword}

          autoComplete="new-password"

        />

        <AuthError message={message} />

        <AuthPrimaryButton className="w-full" disabled={busy}>

          {busy ? "Creating account…" : "Create account"}

        </AuthPrimaryButton>

      </form>

      <AuthFooterLink prompt="Have an account?" linkLabel="Login" href="/admin/login" />

      <p className="mt-4 text-center text-xs text-zinc-500">

        Accounts created here are admin accounts for this site.{" "}

        <Link href="/admin/login" className="text-[#4a6d95] hover:underline">

          Back to login

        </Link>

      </p>

    </AuthShell>

  );

}

