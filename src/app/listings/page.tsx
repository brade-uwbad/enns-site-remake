import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Listings</h1>
      <p className="mt-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
        Listing cards and filters will connect to your API and database later. For now, you can hit the
        JSON endpoint while building the UI.
      </p>
      <p className="mt-4">
        <Link
          href="/api/listings"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-zinc-300"
        >
          Open /api/listings
        </Link>
      </p>
    </div>
  );
}
