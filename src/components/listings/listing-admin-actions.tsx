"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAdminUser } from "@/hooks/use-admin-user";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";

type ListingAdminActionsProps = {
  listingId: string;
  status: "active" | "sold" | "draft";
};

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function ListingAdminActions({ listingId, status }: ListingAdminActionsProps) {
  const router = useRouter();
  const { loading, admin, accessToken } = useAdminUser();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (loading || !admin) {
    return null;
  }

  async function patchStatus(nextStatus: "active" | "sold") {
    if (!accessToken || !isSupabaseBrowserConfigured()) {
      setMessage("Sign in as admin to update this listing.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(
          nextStatus === "sold"
            ? { status: "sold", soldAt: new Date().toISOString() }
            : { status: "active", soldAt: null },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.error?.message ??
            (nextStatus === "sold" ? "Could not mark as sold." : "Could not mark as active."),
        );
      }
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not update listing status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2">
        {status === "sold" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void patchStatus("active")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#e6e8ec] px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-[#d8dadf] disabled:opacity-50"
          >
            <PencilIcon className="h-4 w-4 shrink-0" />
            Mark as active
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => void patchStatus("sold")}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#e6e8ec] px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-[#d8dadf] disabled:opacity-50"
          >
            <PencilIcon className="h-4 w-4 shrink-0" />
            Mark as sold
          </button>
        )}
        <Link
          href={`/admin/listings?edit=${listingId}`}
          className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#4a6d95] px-3 py-2.5 text-sm font-medium text-white hover:bg-[#3f5f84] ${
            status === "sold" ? "flex-1" : "flex-1"
          }`}
        >
          <PencilIcon className="h-4 w-4 shrink-0" />
          Edit listing
        </Link>
      </div>
      {message ? <p className="text-xs text-red-600">{message}</p> : null}
    </div>
  );
}

