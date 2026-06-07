"use client";

import Image from "next/image";

import {
  PROPERTY_TYPE_LABEL,
  type Listing,
} from "@/components/admin/listings-editor/types";

type AdminListingsGridProps = {
  listings: Listing[];
  busy: boolean;
  onEditListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
};

function formatPrice(priceDollars: number | null) {
  if (priceDollars === null) {
    return "Price on request";
  }
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(priceDollars);
}

function cardSpecLine(listing: Listing) {
  const parts = [
    listing.property_type ? PROPERTY_TYPE_LABEL[listing.property_type] : null,
    listing.beds !== null ? `${listing.beds} Bed` : null,
    listing.baths !== null ? `${listing.baths} Bath` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

function cardTitle(listing: Listing) {
  return listing.address_line || listing.title;
}

export function AdminListingsGrid({
  listings,
  busy,
  onEditListing,
  onDeleteListing,
}: AdminListingsGridProps) {
  if (listings.length === 0) {
    return <p className="text-sm text-slate-600">No listings yet. Create one to get started.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {listings.map((listing) => (
        <article
          key={listing.id}
          className="flex flex-col overflow-hidden rounded-sm border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
        >
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <Image
              src={
                listing.featured_image_url ||
                listing.images?.[0] ||
                "https://placehold.co/1200x700/png?text=Listing"
              }
              alt={cardTitle(listing)}
              width={1200}
              height={750}
              className="h-full w-full object-cover"
            />
            {listing.status === "sold" ? (
              <span className="absolute left-2 top-2 rounded-sm bg-slate-900/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Sold
              </span>
            ) : null}
          </div>
          <div className="space-y-2 px-4 py-3">
            <p className="line-clamp-1 text-base font-semibold text-slate-900">
              {cardTitle(listing)}
            </p>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">
                {formatPrice(listing.price_dollars)}
              </p>
              <p className="line-clamp-1 text-xs text-slate-500">{cardSpecLine(listing)}</p>
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 border-t border-slate-200">
            <button
              type="button"
              disabled={busy}
              onClick={() => onEditListing(listing.id)}
              className="px-3 py-2.5 text-sm font-medium text-[#3A6696] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDeleteListing(listing.id)}
              className="border-l border-slate-200 px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
