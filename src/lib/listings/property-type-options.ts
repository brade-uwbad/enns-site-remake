import type { PropertyType } from "@/components/admin/listings-editor/types";

export const PROPERTY_TYPE_OPTIONS: {
  value: PropertyType;
  label: string;
  iconGrey: string;
  iconBlue: string;
}[] = [
  {
    value: "apartment",
    label: "Apartment",
    iconGrey: "/icons/house_grey.png",
    iconBlue: "/icons/house_blue.png",
  },
  {
    value: "detached",
    label: "Detached",
    iconGrey: "/icons/detached_grey.png",
    iconBlue: "/icons/detached_blue.png",
  },
  {
    value: "townhouse",
    label: "Townhouse",
    iconGrey: "/icons/townhouse_grey.png",
    iconBlue: "/icons/townhouse_blue.png",
  },
  {
    value: "condo",
    label: "Condo",
    iconGrey: "/icons/condo_grey.png",
    iconBlue: "/icons/condo_blue.png",
  },
];
