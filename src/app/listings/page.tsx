import type { Metadata } from "next";
import { ListingsGrid } from "@/components/listings/listings-grid";

export const metadata: Metadata = {
  title: "Listings",
  description: "Active and sold property listings.",
};

/**
 * Marketing listings index matching design layout (category strip + grid).
 */
export default function ListingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Listings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse active and sold properties. Data loads from your Supabase-backed API.
        </p>
      </div>

      <div className="mt-8">
        <ListingsGrid />
      </div>
    </div>
  );
}
