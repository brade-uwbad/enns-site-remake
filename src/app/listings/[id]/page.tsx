import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingDetailView } from "@/components/listings/listing-detail-view";
import { fetchListings, fetchPublicListingById } from "@/lib/listings/query";

type Params = { params: Promise<{ id: string }> };

type PublicListing = Awaited<ReturnType<typeof fetchPublicListingById>>;

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
  return {
    title: `${listing.title} | Listings`,
    description: buildDescription(listing),
    openGraph: {
      title: listing.title,
      description: buildDescription(listing),
      images: [listing.featured_image_url || listing.images[0] || "https://placehold.co/1200x700/png?text=Listing"],
    },
  };
}

function postalPrefix(value: string | null) {
  if (!value) return null;
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

/**
 * Best-effort proximity ranking without geo coordinates.
 * Postal prefix (FSA) is usually the tightest local bucket, then city, then province.
 */
function nearbyRank(source: NonNullable<PublicListing>, candidate: NonNullable<PublicListing>) {
  let score = 0;
  if (
    postalPrefix(source.postal_code) &&
    postalPrefix(source.postal_code) === postalPrefix(candidate.postal_code)
  ) {
    score += 100;
  }
  if (
    source.city?.trim().toLowerCase() &&
    source.city?.trim().toLowerCase() === candidate.city?.trim().toLowerCase()
  ) {
    score += 20;
  }
  if (
    source.province?.trim().toLowerCase() &&
    source.province?.trim().toLowerCase() === candidate.province?.trim().toLowerCase()
  ) {
    score += 5;
  }
  return score;
}

export default async function ListingDetailPage(ctx: Params) {
  const { id } = await ctx.params;
  const listing = await fetchPublicListingById(id);
  if (!listing) {
    notFound();
  }

  const { items } = await fetchListings(listing.status === "sold" ? "sold" : "active", {
    page: 1,
    limit: 100,
  });

  const originHasCoords =
    typeof listing.latitude === "number" && typeof listing.longitude === "number";

  const nearby = originHasCoords
    ? items
        .filter((item) => item.id !== listing.id)
        .map((item) => {
          const hasCoords = typeof item.latitude === "number" && typeof item.longitude === "number";
          if (!hasCoords) return { item, distanceKm: Number.POSITIVE_INFINITY };
          const distanceKm = haversineKm(
            { latitude: listing.latitude as number, longitude: listing.longitude as number },
            { latitude: item.latitude as number, longitude: item.longitude as number },
          );
          return { item, distanceKm };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 5)
        .map((entry) => entry.item)
    : items
        .filter((item) => item.id !== listing.id)
        .sort((a, b) => nearbyRank(listing, b) - nearbyRank(listing, a))
        .slice(0, 5);

  return <ListingDetailView listing={listing} nearby={nearby} />;
}
