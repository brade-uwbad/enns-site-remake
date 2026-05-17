"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/public-config";

type AdminShellProps = {
  children: React.ReactNode;
  email: string | null;
};

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/site", label: "Site content" },
];

export function AdminShell({ children, email }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const canUseSupabaseAuth = Boolean(getSupabaseUrl() && getSupabaseAnonKey());

  async function signOut() {
    if (!canUseSupabaseAuth) {
      router.push("/admin/login");
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {nav.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 font-medium ${
                  active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm text-zinc-600">
          {email ? <span className="truncate">{email}</span> : null}
          {canUseSupabaseAuth ? (
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={busy}
              className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
            >
              Log out
            </button>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
