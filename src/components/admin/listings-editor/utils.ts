import {
  amenitySelectionsFromStored,
  type ListingAmenitySelections,
} from "@/lib/listings/listing-amenities";
import {
  PROPERTY_TYPE_LABEL,
  type EditorState,
  type Listing,
  type PropertyType,
} from "@/components/admin/listings-editor/types";

export function deriveSubtitle(
  form: EditorState,
  existingPropertyType?: PropertyType | null,
): string | null {
  const propertyType = form.propertyType || existingPropertyType || null;
  const parts = [
    form.beds.trim() ? `${form.beds.trim()} Bed` : null,
    form.baths.trim() ? `${form.baths.trim()} Bath` : null,
    propertyType ? PROPERTY_TYPE_LABEL[propertyType] : null,
    form.city.trim() ? `in ${form.city.trim()}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

export function filterValidImageUrls(urls: string[]): string[] {
  return urls.filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  });
}

export type ListingWritePayload = {
  title: string;
  subtitle: string | null;
  city: string | null;
  province: string | null;
  postalCode: string;
  addressLine: string;
  priceDollars: number | null;
  description: string | null;
  amenities: string[];
  images: string[];
  featuredImageUrl: string | null;
  status: EditorState["status"];
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  propertyType: PropertyType | null;
};

export function buildListingWritePayload(
  form: EditorState,
  images: string[],
  options?: { existing?: Pick<Listing, "property_type"> | null },
): Omit<ListingWritePayload, "amenities"> {
  const propertyType = form.propertyType || options?.existing?.property_type || null;
  const address = form.addressLine.trim();
  const beds = parseIntOrNull(form.beds);
  const baths = parseFloatOrNull(form.baths);
  const sqft = parseIntOrNull(form.sqft);

  return {
    title: address,
    subtitle: deriveSubtitle(form, options?.existing?.property_type ?? null),
    city: form.city || null,
    province: form.province || null,
    postalCode: form.postalCode.trim(),
    addressLine: address,
    priceDollars: form.priceDollars.trim() ? Number(form.priceDollars) : null,
    description: form.description || null,
    images: filterValidImageUrls(images),
    featuredImageUrl: filterValidImageUrls(images)[0] ?? null,
    status: form.status,
    beds,
    baths,
    sqft,
    propertyType,
  };
}

function imagesWithFeaturedFirst(images: string[], featured: string | null): string[] {
  if (!featured || images.length === 0) {
    return images;
  }
  const idx = images.indexOf(featured);
  if (idx <= 0) {
    return images;
  }
  return [featured, ...images.filter((_, i) => i !== idx)];
}

export function toEditorState(listing: Listing): EditorState {
  const images = imagesWithFeaturedFirst(
    listing.images ?? [],
    listing.featured_image_url ?? null,
  );

  return {
    city: listing.city ?? "",
    province: listing.province ?? "",
    postalCode: listing.postal_code ?? "",
    addressLine: listing.address_line ?? "",
    priceDollars:
      listing.price_dollars === null || listing.price_dollars === undefined
        ? ""
        : String(listing.price_dollars),
    description: listing.description ?? "",
    amenitySelections: amenitySelectionsFromStored(listing.amenities ?? []),
    imagesText: images.join("\n"),
    status: listing.status,
    beds: listing.beds === null || listing.beds === undefined ? "" : String(listing.beds),
    baths:
      listing.baths === null || listing.baths === undefined ? "" : String(listing.baths),
    sqft: listing.sqft === null || listing.sqft === undefined ? "" : String(listing.sqft),
    propertyType: listing.property_type ?? "",
  };
}

export function parseIntOrNull(s: string): number | null {
  if (!s.trim()) {
    return null;
  }
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

export function parseFloatOrNull(s: string): number | null {
  if (!s.trim()) {
    return null;
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return Math.round(n * 10) / 10;
}

export function splitList(text: string) {
  return text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toggleAmenitySelection(
  current: ListingAmenitySelections,
  id: keyof ListingAmenitySelections,
): ListingAmenitySelections {
  return {
    ...current,
    [id]: !current[id],
  };
}
