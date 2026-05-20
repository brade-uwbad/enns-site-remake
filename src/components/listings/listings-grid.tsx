"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PropertyType = "apartment" | "detached" | "townhouse" | "condo";

type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  address_line: string | null;
  price_dollars: number | null;
  description: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: PropertyType | null;
  amenities: string[];
  images: string[];
  featured_image_url: string | null;
  status: "active" | "sold" | "draft";
};

const CATEGORIES: { label: string; value: PropertyType; icon: string }[] = [
  { label: "Apartment", value: "apartment", icon: "⌂" },
  { label: "Detached", value: "detached", icon: "⌂" },
  { label: "Townhouse", value: "townhouse", icon: "⌂" },
  { label: "Condo", value: "condo", icon: "⌂" },
];

const PROPERTY_LABEL: Record<PropertyType, string> = {
  apartment: "Apartment",
  detached: "Detached",
  townhouse: "Townhouse",
  condo: "Condo",
};

type Filters = {
  status: "active" | "sold";
  minPrice: string;
  maxPrice: string;
  beds: string;
  q: string;
  propertyType: "" | PropertyType;
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
    listing.property_type ? PROPERTY_LABEL[listing.property_type] : null,
    listing.beds !== null ? `${listing.beds} Bed` : null,
    listing.baths !== null ? `${listing.baths} Bath` : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

function cardTitle(listing: Listing) {
  return listing.address_line || listing.title;
}

function buildQuery(filters: Filters) {
  const params = new URLSearchParams({ limit: "100" });
  if (filters.q.trim()) {
    params.set("q", filters.q.trim());
  }
  if (filters.propertyType) {
    params.set("propertyType", filters.propertyType);
  }
  if (filters.minPrice.trim()) {
    params.set("minPrice", filters.minPrice.trim());
  }
  if (filters.maxPrice.trim()) {
    params.set("maxPrice", filters.maxPrice.trim());
  }
  if (filters.beds.trim()) {
    params.set("beds", filters.beds.trim());
  }
  return params.toString();
}

export function ListingsGrid() {
  const [filters, setFilters] = useState<Filters>({
    status: "active",
    minPrice: "",
    maxPrice: "",
    beds: "",
    q: "",
    propertyType: "",
  });
  const [searchInput, setSearchInput] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: searchInput }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const queryString = useMemo(() => buildQuery(filters), [filters]);

  useEffect(() => {
    const endpoint = filters.status === "sold" ? "/api/listings/sold" : "/api/listings";
    const loadListings = async () => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(`${endpoint}?${queryString}`);
        const data = await r.json();
        if (data?.error?.message) {
          throw new Error(data.error.message as string);
        }
        setListings(data?.data?.listings ?? []);
      } catch {
        setError("Could not load listings.");
      } finally {
        setLoading(false);
      }
    };
    void loadListings();
  }, [filters.status, queryString]);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const activeCategory = filters.propertyType;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10">
        {CATEGORIES.map((cat) => {
          const selected = activeCategory === cat.value;
          return (
            <button
              key={cat.label}
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  propertyType: prev.propertyType === cat.value ? "" : cat.value,
                }))
              }
              className="flex flex-col items-center gap-2 text-center"
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg text-slate-600 transition ${
                  selected ? "border-sky-600 bg-sky-50 text-sky-800" : "border-slate-200 bg-white"
                }`}
                aria-hidden
              >
                {cat.icon}
              </span>
              <span
                className={`text-xs font-medium ${selected ? "text-sky-800" : "text-slate-600"}`}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, status: "active" }))}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              filters.status === "active"
                ? "border-sky-600 bg-sky-600 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, status: "sold" }))}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              filters.status === "sold"
                ? "border-sky-600 bg-sky-600 text-white"
                : "border-slate-300 bg-white text-slate-700"
            }`}
          >
            Sold
          </button>
          <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
          <input
            type="number"
            min="0"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="0"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <select
            value={filters.beds}
            onChange={(e) => setFilters((prev) => ({ ...prev, beds: e.target.value }))}
            className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Any beds</option>
            <option value="1">1 bed</option>
            <option value="2">2 beds</option>
            <option value="3">3 beds</option>
            <option value="4">4 beds</option>
            <option value="5">5 beds</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setFilters((prev) => ({
                ...prev,
                minPrice: "",
                maxPrice: "",
                beds: "",
                q: "",
                propertyType: "",
              }));
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          >
            Reset
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <input
            type="search"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-full border border-slate-300 bg-white py-2 pl-4 pr-10 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            ⌕
          </span>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading listings...</p> : null}

      {!loading && listings.length === 0 ? (
        <p className="text-sm text-slate-600">No listings match these filters.</p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <Link
            href={`/listings/${listing.id}`}
            key={listing.id}
            className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={
                  listing.featured_image_url ||
                  listing.images?.[0] ||
                  "https://placehold.co/1200x700/png?text=Listing"
                }
                alt={listing.title}
                width={1200}
                height={750}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              {listing.status === "sold" ? (
                <span className="absolute left-2 top-2 rounded bg-slate-900/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
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
          </Link>
        ))}
      </div>
    </div>
  );
}
