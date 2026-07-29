import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailView } from "@/components/listings/listing-detail-view";
import { JsonLd, type JsonLdData } from "@/components/seo/json-ld";
import {
  fetchListings,
  fetchPostalCentroids,
  fetchPublicListingById,
} from "@/lib/listings/query";
import type { ListingRow } from "@/lib/store/types";
import { absoluteUrl } from "@/lib/site-config";
import { getShowNearbyListings } from "@/lib/settings/nearby-listings";
import { getListingCategories } from "@/lib/listings/listing-categories-store";

type Params = { params: Promise<{ id: string }> };

// Cache each listing page and refresh hourly; admin create/update/delete revalidate this path
// on demand so edits appear immediately.
export const revalidate = 3600;

/** Absolute image URLs for a listing (featured first), for OG tags and structured data. */
function listingImageUrls(listing: Pick<ListingRow, "featured_image_url" | "images">): string[] {
  const urls = [listing.featured_image_url, ...(listing.images ?? [])].filter(
    (url): url is string => Boolean(url),
  );
  return Array.from(new Set(urls));
}

/** Build `RealEstateListing` + `BreadcrumbList` structured data for a listing. */
function buildListingJsonLd(listing: ListingRow): JsonLdData[] {
  const url = absoluteUrl(`/listings/${listing.id}`);
  const images = listingImageUrls(listing);

  const realEstateListing: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": url,
    url,
    name: listing.title,
    description: buildDescription(listing),
    ...(images.length > 0 ? { image: images } : {}),
    ...(listing.status === "sold" ? { availability: "https://schema.org/SoldOut" } : {}),
    ...(listing.price_dollars !== null
      ? {
          offers: {
            "@type": "Offer",
            price: listing.price_dollars,
            priceCurrency: "CAD",
            availability:
              listing.status === "sold"
                ? "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
          },
        }
      : {}),
    ...(listing.address_line || listing.city
      ? {
          address: {
            "@type": "PostalAddress",
            ...(listing.address_line ? { streetAddress: listing.address_line } : {}),
            ...(listing.city ? { addressLocality: listing.city } : {}),
            ...(listing.province ? { addressRegion: listing.province } : {}),
            ...(listing.postal_code ? { postalCode: listing.postal_code } : {}),
            addressCountry: "CA",
          },
        }
      : {}),
    ...(listing.latitude !== null && listing.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.latitude,
            longitude: listing.longitude,
          },
        }
      : {}),
    broker: { "@id": absoluteUrl("/#agent") },
  };

  const breadcrumb: JsonLdData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Listings", item: absoluteUrl("/listings") },
      { "@type": "ListItem", position: 3, name: listing.title, item: url },
    ],
  };

  return [realEstateListing, breadcrumb];
}

function buildDescription(listing: {
  subtitle: string | null;
  description: string | null;
  city: string | null;
}) {
  return (
    listing.subtitle ||
    listing.description ||
    (listing.city ? `Property details for ${listing.city}.` : "Property listing detail page.")
  );
}

export async function generateMetadata(ctx: Params): Promise<Metadata> {
  const { id } = await ctx.params;
  const listing = await fetchPublicListingById(id);
  if (!listing) {
    return {
      title: "Listing not found",
      description: "This listing is not available.",
    };
  }
  const canonical = `/listings/${id}`;
  const images = listingImageUrls(listing);
  return {
    title: `${listing.title} | Listings`,
    description: buildDescription(listing),
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: listing.title,
      description: buildDescription(listing),
      url: canonical,
      images: [
        images[0] || "https://placehold.co/1200x700/png?text=Listing",
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: buildDescription(listing),
      images: [images[0] || "https://placehold.co/1200x700/png?text=Listing"],
    },
  };
}

function postalPrefix(value: string | null) {
  if (!value) {
    return null;
  }
  const normalized = value.replace(/\s+/g, "").toUpperCase();
  return normalized.length >= 3 ? normalized.slice(0, 3) : null;
}

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
) {
  const R = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

type Coords = { latitude: number; longitude: number };

function hasCoords(value: { latitude: number | null; longitude: number | null }): value is Coords {
  return typeof value.latitude === "number" && typeof value.longitude === "number";
}

export default async function ListingDetailPage(ctx: Params) {
  const { id } = await ctx.params;
  const listing = await fetchPublicListingById(id);
  if (!listing) {
    notFound();
  }

  const [showNearby, categories] = await Promise.all([
    getShowNearbyListings(),
    getListingCategories(),
  ]);

  const listingJsonLd = buildListingJsonLd(listing);

  if (!showNearby) {
    return (
      <>
        <JsonLd data={listingJsonLd} />
        <ListingDetailView listing={listing} nearby={[]} categories={categories} />
      </>
    );
  }

  const { items } = await fetchListings(listing.status === "sold" ? "sold" : "active", {
    page: 1,
    limit: 100,
  });

  const candidates = items.filter((item) => item.id !== listing.id);
  const sourcePrefix = postalPrefix(listing.postal_code);
  const candidatePrefixes = candidates
    .map((item) => postalPrefix(item.postal_code))
    .filter((p): p is string => Boolean(p));
  const centroidMap = await fetchPostalCentroids(
    sourcePrefix ? [sourcePrefix, ...candidatePrefixes] : candidatePrefixes,
  );

  const sourceCentroid = sourcePrefix ? centroidMap[sourcePrefix] : undefined;
  const sourceCoords = hasCoords(listing)
    ? { latitude: listing.latitude, longitude: listing.longitude }
    : sourceCentroid;

  const nearby = candidates
    .map((item) => {
      const itemCoords = hasCoords(item)
        ? { latitude: item.latitude, longitude: item.longitude }
        : undefined;
      const p = postalPrefix(item.postal_code);
      const c = p ? centroidMap[p] : undefined;
      const destinationCoords = itemCoords ?? c;
      if (!sourceCoords || !destinationCoords) {
        return { item, distanceKm: Number.POSITIVE_INFINITY };
      }
      return { item, distanceKm: haversineKm(sourceCoords, destinationCoords) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5)
    .map((entry) => entry.item);

  return (
    <>
      <JsonLd data={listingJsonLd} />
      <ListingDetailView listing={listing} nearby={nearby} categories={categories} />
    </>
  );
}
