"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAdminUser } from "@/hooks/use-admin-user";

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

const CATEGORIES: {
  label: string;
  value: PropertyType;
  iconGrey: string;
  iconBlue: string;
}[] = [
  {
    label: "Apartment",
    value: "apartment",
    iconGrey: "/icons/house_grey.png",
    iconBlue: "/icons/house_blue.png",
  },
  {
    label: "Detached",
    value: "detached",
    iconGrey: "/icons/detached_grey.png",
    iconBlue: "/icons/detached_blue.png",
  },
  {
    label: "Townhouse",
    value: "townhouse",
    iconGrey: "/icons/townhouse_grey.png",
    iconBlue: "/icons/townhouse_blue.png",
  },
  {
    label: "Condo",
    value: "condo",
    iconGrey: "/icons/condo_grey.png",
    iconBlue: "/icons/condo_blue.png",
  },
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

const SKELETON_CARD_COUNT = 8;

function ListingCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
      aria-hidden
    >
      <div className="aspect-[16/10] w-full animate-pulse bg-slate-200" />
      <div className="space-y-3 px-4 py-3">
        <div className="h-4 w-[85%] animate-pulse rounded-sm bg-slate-200" />
        <div className="flex items-center justify-between gap-3">
          <div className="h-3.5 w-20 animate-pulse rounded-sm bg-slate-200" />
          <div className="h-3 w-28 animate-pulse rounded-sm bg-slate-200" />
        </div>
      </div>
    </div>
  );
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
  const { admin } = useAdminUser();
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
      setListings([]);
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
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-start sm:justify-center sm:gap-5">
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
              className={`flex w-full flex-col items-center gap-3 rounded-md bg-white px-3 py-4 transition sm:w-[108px] ${
                selected
                  ? "border border-[#3A6696] shadow-none"
                  : "border border-transparent shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
              }`}
              aria-pressed={selected}
            >
              <Image
                src={selected ? cat.iconBlue : cat.iconGrey}
                alt=""
                width={24}
                height={24}
                unoptimized
                className="h-6 w-6 shrink-0 object-contain"
              />
              <span className={`text-xs font-medium ${selected ? "text-[#3A6696]" : "text-slate-500"}`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative w-full sm:max-w-xs sm:self-end">
          <input
            type="search"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-sm border border-slate-300 bg-white py-2 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-500 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            ⌕
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex overflow-hidden rounded-sm border border-slate-300 bg-white">
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: "active" }))}
                className={`border-r px-5 py-2 text-xs font-semibold uppercase tracking-wide ${
                  filters.status === "active"
                    ? "border-sky-600 bg-white text-sky-600"
                    : "border-slate-300 bg-white text-slate-400"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, status: "sold" }))}
                className={`px-5 py-2 text-xs font-semibold uppercase tracking-wide ${
                  filters.status === "sold"
                    ? "bg-white text-sky-600 ring-1 ring-inset ring-sky-600"
                    : "bg-white text-slate-400"
                }`}
              >
                Sold
              </button>
            </div>
            {admin ? (
              <Link
                href="/admin/listings?create=1"
                className="rounded-sm bg-[#e6e8ec] px-4 py-2 text-sm font-medium text-slate-900 hover:bg-[#d8dadf]"
              >
                + Create a new listing
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <input
              type="number"
              min="0"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
              className="min-w-0 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 sm:w-28"
            />
            <input
              type="number"
              min="0"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
              className="min-w-0 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 sm:w-28"
            />
            <select
              value={filters.beds}
              onChange={(e) => setFilters((prev) => ({ ...prev, beds: e.target.value }))}
              className={`min-w-0 rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm sm:w-36 ${
                filters.beds ? "text-slate-900" : "text-slate-500"
              }`}
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
              className="rounded-sm bg-[#e6e8ec] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[#d8dadf] sm:w-auto"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          aria-busy="true"
          aria-label="Loading listings"
        >
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {!loading && listings.length === 0 ? (
        <p className="text-sm text-slate-600">No listings match these filters.</p>
      ) : null}

      {!loading && listings.length > 0 ? (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map((listing) => (
          <Link
            href={`/listings/${listing.id}`}
            key={listing.id}
            className="group overflow-hidden rounded-sm border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.1)]"
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
                unoptimized
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              {listing.status === "sold" ? (
                <span className="absolute left-2 top-2 rounded-sm bg-slate-900/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Sold
                </span>
              ) : null}
            </div>
            <div className="space-y-2 px-4 py-3">
              <p className="line-clamp-1 text-base font-semibold text-slate-900">{cardTitle(listing)}</p>
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
      ) : null}
    </div>
  );
}
