"use client";

import Image from "next/image";
import Link from "next/link";
import { ListingDetailGallery } from "@/components/listings/listing-detail-gallery";
import { ListingAdminActions } from "@/components/listings/listing-admin-actions";
import {
  amenityIconPath,
  canonicalAmenitiesFromStored,
  type ListingAmenityLabel,
} from "@/lib/listings/listing-amenities";

type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  price_dollars: number | null;
  address_line: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: "apartment" | "detached" | "townhouse" | "condo" | null;
  featured_image_url: string | null;
  images: string[];
  amenities: string[];
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
    maximumFractionDigits: 0,
  }).format(priceDollars);
}

function fullAddress(listing: Listing) {
  return [listing.address_line, listing.city, listing.province, listing.postal_code]
    .filter(Boolean)
    .join(", ");
}

const PROPERTY_TYPE_LABEL: Record<NonNullable<Listing["property_type"]>, string> = {
  apartment: "Apartment",
  detached: "Detached",
  townhouse: "Townhouse",
  condo: "Condo",
};

function specLine(listing: Listing) {
  const parts = [
    listing.beds !== null ? `${listing.beds} Bed` : null,
    listing.baths !== null ? `${listing.baths} Bath` : null,
    listing.property_type ? PROPERTY_TYPE_LABEL[listing.property_type] : null,
    listing.city ? `in ${listing.city}` : null,
  ].filter(Boolean);
  return parts.join(" ");
}

function ListingAmenityRow({ label }: { label: ListingAmenityLabel }) {
  const src = amenityIconPath(label);
  return (
    <li className="flex items-center gap-3 text-sm text-slate-700">
      {src ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
          <Image src={src} alt="" width={24} height={24} className="max-h-6 max-w-6 object-contain" unoptimized />
        </span>
      ) : null}
      <span>{label}</span>
    </li>
  );
}

type Props = {
  listing: Listing;
  nearby: Listing[];
};

export function ListingDetailView({ listing, nearby }: Props) {
  const mapQuery = encodeURIComponent(fullAddress(listing) || listing.title);
  const soldPrefix = listing.status === "sold" ? "SOLD - " : "";
  const amenityList = canonicalAmenitiesFromStored(listing.amenities);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <ListingDetailGallery
        title={listing.title}
        featuredImageUrl={listing.featured_image_url}
        images={listing.images}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
                {soldPrefix}
                {listing.address_line || listing.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{specLine(listing)}</p>
            </div>
            <p className="text-xl font-semibold text-slate-900 tabular-nums sm:text-2xl">
              {formatPrice(listing.price_dollars)}
            </p>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {listing.description ||
              "building description building description building description building description building description building description building description building description building description."}
          </p>

          {amenityList.length > 0 ? (
            <section>
              <h2 className="text-base font-semibold text-slate-900">What&apos;s included</h2>
              <ul className="mt-4 grid gap-y-3 gap-x-10 sm:grid-cols-2">
                {amenityList.map((item) => (
                  <ListingAmenityRow key={item} label={item} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <ListingAdminActions listingId={listing.id} status={listing.status} />
          <h2 className="text-base font-semibold text-slate-900">Where you&apos;ll be</h2>
          <iframe
            title={`Map for ${listing.title}`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            className="h-56 w-full rounded-md border border-slate-200 bg-white"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <Link
            href="/contact"
            className="flex w-full items-center justify-center rounded-md border border-sky-600 bg-white px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-sky-700 hover:bg-sky-50"
          >
            Contact Brad about this listing
          </Link>
        </aside>
      </div>

      {nearby.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-base font-semibold text-slate-900">More listings nearby</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {nearby.map((item) => (
              <Link
                href={`/listings/${item.id}`}
                key={item.id}
                className="group block"
              >
                <div className="overflow-hidden rounded-md bg-slate-100">
                  <Image
                    src={
                      item.featured_image_url ||
                      item.images?.[0] ||
                      "https://placehold.co/1200x700/png?text=Listing"
                    }
                    alt={item.title}
                    width={400}
                    height={260}
                    unoptimized
                    className="aspect-[4/3] w-full object-cover transition group-hover:opacity-90"
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-900">
                  {item.address_line || item.title}
                </p>
                <p className="text-[10px] text-slate-400">
                  {[
                    item.beds !== null ? `${item.beds} Bed` : null,
                    item.baths !== null ? `${item.baths} Bath` : null,
                    item.property_type ? PROPERTY_TYPE_LABEL[item.property_type] : null,
                    item.city ? `in ${item.city}` : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
