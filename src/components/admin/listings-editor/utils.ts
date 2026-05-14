import {
  amenitySelectionsFromStored,
  type ListingAmenitySelections,
} from "@/lib/listings/listing-amenities";
import {
  PROPERTY_TYPE_LABEL,
  type EditorState,
  type Listing,
} from "@/components/admin/listings-editor/types";

export function deriveSubtitle(form: EditorState): string | null {
  const parts = [
    form.beds.trim() ? `${form.beds.trim()} Bed` : null,
    form.baths.trim() ? `${form.baths.trim()} Bath` : null,
    form.propertyType ? PROPERTY_TYPE_LABEL[form.propertyType] : null,
    form.city.trim() ? `in ${form.city.trim()}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

export function toEditorState(listing: Listing): EditorState {
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
    imagesText: (listing.images ?? []).join("\n"),
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
  return Number.isFinite(n) ? n : null;
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
