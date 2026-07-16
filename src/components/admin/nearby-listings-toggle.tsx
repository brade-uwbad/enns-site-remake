"use client";

import { useState, useTransition } from "react";

import { setNearbyListingsEnabled } from "@/app/admin/(dashboard)/listings/actions";
import { adminCardClass } from "@/components/admin/admin-ui";

type Props = {
  initialEnabled: boolean;
};

/**
 * Admin switch that turns the public "More listings nearby" section on the
 * listing detail pages on or off site-wide.
 */
export function NearbyListingsToggle({ initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next); // optimistic
    setError(null);

    startTransition(async () => {
      try {
        await setNearbyListingsEnabled(next);
      } catch {
        setEnabled(!next); // roll back on failure
        setError("Couldn't save that. Please try again.");
      }
    });
  };

  return (
    <section className={`${adminCardClass} p-5`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">Nearby listings section</p>
          <p className="mt-1 text-sm text-slate-600">
            Show the &ldquo;More listings nearby&rdquo; suggestions at the bottom of each listing
            page.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Show nearby listings section"
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            enabled ? "bg-[#3A6696]" : "bg-slate-300"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {enabled ? "Currently shown to visitors." : "Currently hidden from visitors."}
      </p>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </section>
  );
}
