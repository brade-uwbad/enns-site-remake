"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  address_line: string | null;
  price_dollars: number | null;
  description: string | null;
  amenities: string[];
  images: string[];
  featured_image_url: string | null;
  status: "active" | "sold" | "draft";
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

export function ListingsGrid() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/listings?limit=100")
      .then((r) => r.json())
      .then((data) => {
        setListings(data?.data?.listings ?? []);
      })
      .catch(() => setError("Could not load listings."));
  }, []);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!listings.length) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">No active listings yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {listings.map((listing) => (
        <article
          key={listing.id}
          className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
        >
          <Image
            src={
              listing.featured_image_url ||
              listing.images?.[0] ||
              "https://placehold.co/1200x700/png?text=Listing"
            }
            alt={listing.title}
            width={1200}
            height={700}
            unoptimized
            className="h-48 w-full object-cover"
          />
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                {listing.title}
              </h2>
              <p className="text-sm font-medium">{formatPrice(listing.price_dollars)}</p>
            </div>
            {listing.subtitle && (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{listing.subtitle}</p>
            )}
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {[listing.address_line, listing.city].filter(Boolean).join(", ")}
            </p>
            {listing.description && (
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{listing.description}</p>
            )}
            {listing.amenities?.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-1">
                {listing.amenities.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-zinc-300 px-2.5 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
