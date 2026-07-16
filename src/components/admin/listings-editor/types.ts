/** A listing's category slug. Categories are admin-editable, so this is free text. */
export type PropertyType = string;

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
  imagesText: "",
  status: "active",
  beds: "",
  baths: "",
  sqft: "",
  propertyType: "",
};

export const WIZARD_STEP_TITLES = [
  "Property Type",
  "Listing Details",
  "Photos",
] as const;

export type EditorPanel = "menu" | "photos" | "details";
