"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAdminUser } from "@/hooks/use-admin-user";
import { isSupabaseBrowserConfigured } from "@/lib/auth/supabase-configured";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

function displayName(firstName: string, lastName: string, email: string) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || email.split("@")[0] || "Admin";
}

function initials(firstName: string, lastName: string, email: string) {
  const a = firstName.trim()[0] ?? "";
  const b = lastName.trim()[0] ?? "";
  if (a && b) {
    return `${a}${b}`.toUpperCase();
  }
  if (a) {
    return a.toUpperCase();
  }
  return (email[0] ?? "A").toUpperCase();
}

export function AdminHeaderAccount() {
  const router = useRouter();
  const { loading, admin } = useAdminUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading || !admin) {
    return null;
  }

  const name = displayName(admin.firstName, admin.lastName, admin.email);
  const abbr = initials(admin.firstName, admin.lastName, admin.email);

  async function signOut() {
    if (!isSupabaseBrowserConfigured()) {
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      setOpen(false);
      router.push("/listings");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white py-1 pl-1 pr-3 text-sm text-[#140000] hover:bg-zinc-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4a6d95] text-xs font-semibold text-white">
          {abbr}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{name}</span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
            <p className="border-b border-zinc-100 px-3 py-2 text-xs text-zinc-500">{admin.email}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void signOut()}
              className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
            >
              Log out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
