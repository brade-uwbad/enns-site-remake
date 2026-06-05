import Image from "next/image";

import { LISTING_AMENITIES } from "@/lib/listings/listing-amenities";
import type { ListingAmenitySelections } from "@/lib/listings/listing-amenities";

type AmenityPickerGridProps = {
  selections: ListingAmenitySelections;
  onToggle: (id: (typeof LISTING_AMENITIES)[number]["id"]) => void;
};

export function AmenityPickerGrid({ selections, onToggle }: AmenityPickerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
      {LISTING_AMENITIES.map(({ id, icon }) => {
        const selected = selections[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            aria-pressed={selected}
            className={`flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-md border px-4 py-5 transition ${
              selected
                ? "border-[#3A6696] bg-[#eef4fa] text-[#3A6696]"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            <Image
              src={icon}
              alt=""
              width={32}
              height={32}
              unoptimized
              className={`h-8 w-8 object-contain ${selected ? "" : "opacity-70"}`}
            />
            <span className={`text-sm font-medium ${selected ? "text-[#3A6696]" : "text-slate-600"}`}>
              {id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
