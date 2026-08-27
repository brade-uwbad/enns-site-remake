import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { ListingsGrid } from "@/components/listings/listings-grid";
import { getListingCategories } from "@/lib/listings/listing-categories-store";

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Listings",
  description:
    "Browse active and recently sold homes for sale in Kitchener–Waterloo and surrounding communities.",
  alternates: { canonical: "/listings" },
  openGraph: {
    title: "Listings | Brad Enns",
    description:
      "Browse active and recently sold homes for sale in Kitchener–Waterloo and surrounding communities.",
    url: "/listings",
  },
};

// Listings render live via a client-side fetch; the server shell can be cached and refreshed
// on demand (the categories admin route revalidates this path).
export const revalidate = 3600;

/**
 * Marketing listings index matching design layout (category strip + grid).
 */
export default async function ListingsPage() {
  const categories = await getListingCategories();

  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 ${poppins.className}`}>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-medium text-slate-900 sm:text-4xl md:text-5xl">Listings</h1>
      </div>

      <div className="mt-8">
        <ListingsGrid categories={categories} />
      </div>
    </div>
  );
}
