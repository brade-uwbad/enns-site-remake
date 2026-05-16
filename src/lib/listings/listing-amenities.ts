/**
 * Predefined amenities for listings: admin checkboxes persist these exact labels;
 * detail pages map them to PNGs under /public/icons.
 */
export const LISTING_AMENITIES = [
  { id: "TV", icon: "/icons/tv_listing_icon.png" },
  { id: "Kitchen", icon: "/icons/kitchen_listing_icon.png" },
  { id: "Washer/Dryer", icon: "/icons/washer_dryer_listing_icon.png" },
  { id: "Parking", icon: "/icons/parking_listing_icon.png" },
  { id: "Fireplace", icon: "/icons/fireplace_listing_icon.png" },
  { id: "Wifi", icon: "/icons/wifi_listing_icon.png" },
  { id: "Office", icon: "/icons/office_listing_icon.png" },
  { id: "AC/Heating", icon: "/icons/ac_heating_listing_icon.png" },
  { id: "Gym", icon: "/icons/gym_listing_icon.png" },
] as const;

export type ListingAmenityLabel = (typeof LISTING_AMENITIES)[number]["id"];

export const LISTING_AMENITY_ORDER = LISTING_AMENITIES.map((a) => a.id);

const CANONICAL_BY_NORMALIZED = new Map<string, ListingAmenityLabel>();
for (const { id } of LISTING_AMENITIES) {
  CANONICAL_BY_NORMALIZED.set(id.toLowerCase().replace(/\s+/g, " ").trim(), id);
}

/** Phrases saved before checkboxes existed; lowercase, single-space normalized keys. */
const LEGACY_ALIAS_TO_CANONICAL: Record<string, ListingAmenityLabel> = {
  tv: "TV",
  hdtv: "TV",
  television: "TV",
  wifi: "Wifi",
  "wi-fi": "Wifi",
  internet: "Wifi",
  kitchen: "Kitchen",
  parking: "Parking",
  fireplace: "Fireplace",
  office: "Office",
  workspace: "Office",
  "dedicated workspace": "Office",
  gym: "Gym",
  "washer/dryer": "Washer/Dryer",
  "washer dryer": "Washer/Dryer",
  laundry: "Washer/Dryer",
  "in-unit washer and dryer": "Washer/Dryer",
  "in-unit laundry": "Washer/Dryer",
  "ac/heating": "AC/Heating",
  "ac / heating": "AC/Heating",
  "air conditioning": "AC/Heating",
  "central air": "AC/Heating",
  "central heating": "AC/Heating",
};

export function normalizeStoredAmenityToCanonical(raw: string): ListingAmenityLabel | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const direct = CANONICAL_BY_NORMALIZED.get(trimmed.toLowerCase());
  if (direct) {
    return direct;
  }
  const key = trimmed.toLowerCase().replace(/\s+/g, " ");
  return LEGACY_ALIAS_TO_CANONICAL[key] ?? null;
}

export function canonicalAmenitiesFromStored(stored: string[]): ListingAmenityLabel[] {
  const seen = new Set<ListingAmenityLabel>();
  for (const raw of stored) {
    const c = normalizeStoredAmenityToCanonical(raw);
    if (c) {
      seen.add(c);
    }
  }
  return LISTING_AMENITY_ORDER.filter((id) => seen.has(id));
}

export function amenityIconPath(label: ListingAmenityLabel): string | undefined {
  const row = LISTING_AMENITIES.find((a) => a.id === label);
  return row?.icon;
}

export type ListingAmenitySelections = Record<ListingAmenityLabel, boolean>;

export function emptyAmenitySelections(): ListingAmenitySelections {
  return Object.fromEntries(LISTING_AMENITY_ORDER.map((id) => [id, false])) as ListingAmenitySelections;
}

export function amenitySelectionsFromStored(stored: string[]): ListingAmenitySelections {
  const selected = new Set(canonicalAmenitiesFromStored(stored));
  return Object.fromEntries(LISTING_AMENITY_ORDER.map((id) => [id, selected.has(id)])) as ListingAmenitySelections;
}

export function amenitiesArrayFromSelections(sel: ListingAmenitySelections): ListingAmenityLabel[] {
  return LISTING_AMENITY_ORDER.filter((id) => sel[id]);
}
