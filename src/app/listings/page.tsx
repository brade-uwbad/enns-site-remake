import type { Metadata } from "next";
import Link from "next/link";
import { ListingsGrid } from "@/components/listings/listings-grid";

export const metadata: Metadata = {
  title: "Listings",
  description: "Active and sold property listings.",
};

/**
 * Listings index placeholder; will later list properties from the API / database.
 *
 * @returns JSX for `/listings`.
 */
export default function ListingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Listings
          </h1>
          <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
            Active listings synced from your Supabase-backed API.
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <Link
            href="/admin/listings"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Open admin editor
          </Link>
          <Link
            href="/api/listings"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Open JSON API
          </Link>
        </div>
      </div>
      <ListingsGrid />
    </div>
  );
}
