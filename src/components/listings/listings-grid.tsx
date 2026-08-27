"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAdminUser } from "@/hooks/use-admin-user";
import { SoldRibbon } from "@/components/listings/sold-ribbon";
import { labelForCategory, type ListingCategory } from "@/lib/listings/listing-categories";

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
  property_type: string | null;
  images: string[];
  featured_image_url: string | null;
  status: "active" | "sold" | "draft";
};

type Filters = {
  status: "active" | "sold";
  minPrice: string;
  maxPrice: string;
  beds: string;
  q: string;
  propertyType: string;
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

function cardSpecLine(listing: Listing, categories: ListingCategory[]) {
  const parts = [
    listing.property_type ? labelForCategory(categories, listing.property_type) : null,
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

function canReorderListings(filters: Filters) {
  return (
    !filters.q.trim() &&
    !filters.minPrice.trim() &&
    !filters.maxPrice.trim() &&
    !filters.beds.trim() &&
    !filters.propertyType
  );
}

function moveListing(listings: Listing[], fromId: string, toId: string) {
  const fromIndex = listings.findIndex((listing) => listing.id === fromId);
  const toIndex = listings.findIndex((listing) => listing.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return listings;
  }
  const next = [...listings];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function ListingsGrid({ categories }: { categories: ListingCategory[] }) {
  const { admin, accessToken } = useAdminUser();
  const defaultPropertyType = categories[0]?.value ?? "";
  const [filters, setFilters] = useState<Filters>(() => ({
    status: "active",
    minPrice: "",
    maxPrice: "",
    beds: "",
    q: "",
    propertyType: defaultPropertyType,
  }));
  const [searchInput, setSearchInput] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [orderedListings, setOrderedListings] = useState<Listing[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
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

  useEffect(() => {
    setOrderedListings(listings);
  }, [listings]);

  const canReorder = Boolean(admin && !loading && canReorderListings(filters));
  const visibleListings = canReorder ? orderedListings : listings;

  async function persistListingOrder(nextOrder: Listing[]) {
    if (!accessToken) {
      setOrderMessage("Sign in as admin to save listing order.");
      setOrderedListings(listings);
      return;
    }

    setSavingOrder(true);
    setOrderMessage("");
    try {
      const res = await fetch("/api/admin/listings/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status: filters.status,
          ids: nextOrder.map((listing) => listing.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to save listing order.");
      }
      setListings(nextOrder);
    } catch (e) {
      setOrderMessage(e instanceof Error ? e.message : "Failed to save listing order.");
      setOrderedListings(listings);
    } finally {
      setSavingOrder(false);
    }
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDropTargetId(null);
      return;
    }

    const nextOrder = moveListing(orderedListings, draggingId, targetId);
    setOrderedListings(nextOrder);
    setDraggingId(null);
    setDropTargetId(null);
    void persistListingOrder(nextOrder);
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const activeCategory = filters.propertyType;

  return (
    <div className="space-y-8">
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-5">
          {categories.map((cat) => {
            const selected = activeCategory === cat.value;
            const icon = selected ? cat.iconBlue : cat.iconGrey;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    propertyType: prev.propertyType === cat.value ? "" : cat.value,
                  }))
                }
                className={`flex h-[6.25rem] w-full flex-col items-center justify-center gap-1.5 rounded-md bg-white px-2 py-2.5 transition sm:w-[7rem] ${
                  selected
                    ? "border border-[#3A6696] shadow-none"
                    : "border border-transparent shadow-[0_4px_14px_rgba(15,23,42,0.08)]"
                }`}
                aria-pressed={selected}
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {icon ? (
                    <Image
                      src={icon}
                      alt=""
                      width={24}
                      height={24}
                      unoptimized
                      className="h-6 w-6 object-contain"
                    />
                  ) : null}
                </div>
                <span
                  className={`flex min-h-[1.75rem] items-center text-center text-xs font-medium leading-tight ${
                    selected ? "text-[#3A6696]" : "text-slate-500"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-nowrap lg:items-center lg:gap-2">
        <div className="relative w-full min-w-0 lg:w-40 lg:shrink-0">
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

        <div className="flex flex-wrap items-center gap-2 lg:contents">
          <div className="inline-flex shrink-0 overflow-hidden rounded-sm border border-slate-300 bg-white">
            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, status: "active" }))}
              className={`border-r px-4 py-2 text-xs font-semibold uppercase tracking-wide sm:px-5 ${
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
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide sm:px-5 ${
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
              className="shrink-0 rounded-sm bg-[#e6e8ec] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[#d8dadf] sm:px-4"
            >
              + Create a new listing
            </Link>
          ) : null}

          <input
            type="number"
            min="0"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            className="min-w-0 flex-[1_1_7.5rem] rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 lg:w-28 lg:flex-none"
          />
          <input
            type="number"
            min="0"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            className="min-w-0 flex-[1_1_7.5rem] rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 lg:w-28 lg:flex-none"
          />
          <select
            value={filters.beds}
            onChange={(e) => setFilters((prev) => ({ ...prev, beds: e.target.value }))}
            className={`min-w-0 flex-[1_1_7.5rem] rounded-sm border border-slate-300 bg-white px-3 py-2 text-sm lg:w-36 lg:flex-none ${
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
                propertyType: defaultPropertyType,
              }));
            }}
            className="shrink-0 rounded-sm bg-[#e6e8ec] px-3 py-2 text-sm font-medium text-slate-900 hover:bg-[#d8dadf]"
          >
            Reset
          </button>
        </div>
      </div>

      {admin && !loading ? (
        <p className="text-xs text-slate-500">
          {canReorder
            ? savingOrder
              ? "Saving listing order..."
              : "Drag a listing card by the handle to reorder how it appears on the site."
            : "Clear filters to reorder listings."}
          {orderMessage ? ` ${orderMessage}` : null}
        </p>
      ) : null}

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
        {visibleListings.map((listing) => (
          <div
            key={listing.id}
            onDragOver={(event) => {
              if (!canReorder || !draggingId || draggingId === listing.id) {
                return;
              }
              event.preventDefault();
              setDropTargetId(listing.id);
            }}
            onDragLeave={() => {
              if (dropTargetId === listing.id) {
                setDropTargetId(null);
              }
            }}
            onDrop={(event) => {
              if (!canReorder) {
                return;
              }
              event.preventDefault();
              handleDrop(listing.id);
            }}
            className={`relative ${
              dropTargetId === listing.id ? "rounded-sm ring-2 ring-[#3A6696]/40" : ""
            }`}
          >
            {canReorder ? (
              <button
                type="button"
                draggable
                aria-label={`Drag to reorder ${cardTitle(listing)}`}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", listing.id);
                  event.dataTransfer.effectAllowed = "move";
                  setDraggingId(listing.id);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDropTargetId(null);
                }}
                className="absolute left-2 top-2 z-20 flex h-8 w-8 cursor-grab items-center justify-center rounded-sm bg-white/95 text-sm text-slate-600 shadow-sm active:cursor-grabbing"
              >
                ⋮⋮
              </button>
            ) : null}
            <Link
              href={`/listings/${listing.id}`}
              className={`group block overflow-hidden rounded-sm border border-slate-200 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.1)] ${
                draggingId === listing.id ? "opacity-60" : ""
              }`}
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
              {listing.status === "sold" ? <SoldRibbon /> : null}
            </div>
            <div className="space-y-2 px-4 py-3">
              <p className="line-clamp-1 text-base font-semibold text-slate-900">
                {cardTitle(listing)}
              </p>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">
                  {formatPrice(listing.price_dollars)}
                </p>
                <p className="line-clamp-1 text-xs text-slate-500">
                  {cardSpecLine(listing, categories)}
                </p>
              </div>
            </div>
            </Link>
          </div>
        ))}
      </div>
      ) : null}
    </div>
  );
}
