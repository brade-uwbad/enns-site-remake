import {
  emptyAmenitySelections,
  type ListingAmenitySelections,
} from "@/lib/listings/listing-amenities";

export type PropertyType = "apartment" | "detached" | "townhouse" | "condo";

export type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  address_line: string | null;
  price_dollars: number | null;
  description: string | null;
  amenities: string[];
  images: string[];
  featured_image_url: string | null;
  status: "active" | "sold" | "draft";
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: PropertyType | null;
};

export type EditorState = {
  city: string;
  province: string;
  postalCode: string;
  addressLine: string;
  priceDollars: string;
  description: string;
  amenitySelections: ListingAmenitySelections;
  imagesText: string;
  status: "active" | "sold" | "draft";
  beds: string;
  baths: string;
  sqft: string;
  propertyType: "" | PropertyType;
};

export const BLANK_EDITOR_STATE: EditorState = {
  city: "",
  province: "",
  postalCode: "",
  addressLine: "",
  priceDollars: "",
  description: "",
  amenitySelections: emptyAmenitySelections(),
  imagesText: "",
  status: "active",
  beds: "",
  baths: "",
  sqft: "",
  propertyType: "",
};

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  apartment: "Apartment",
  detached: "Detached",
  townhouse: "Townhouse",
  condo: "Condo",
};

export const WIZARD_STEP_TITLES = [
  "Property Type",
  "Listing Details",
  "Photos",
  "Amenities",
] as const;

export type EditorPanel = "menu" | "photos" | "details" | "amenities";
