import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { ListingsGrid } from "@/components/listings/listings-grid";

const poppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Listings",
  description: "Active and sold property listings.",
};

/**
 * Marketing listings index matching design layout (category strip + grid).
 */
export default function ListingsPage() {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 ${poppins.className}`}>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-medium text-slate-900 sm:text-4xl md:text-5xl">Listings</h1>
      </div>

      <div className="mt-8">
        <ListingsGrid />
      </div>
    </div>
  );
}
