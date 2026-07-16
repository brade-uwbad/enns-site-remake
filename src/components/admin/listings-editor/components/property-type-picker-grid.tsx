import Image from "next/image";

import type { ListingCategory } from "@/lib/listings/listing-categories";

type PropertyTypePickerGridProps = {
  value: string;
  categories: ListingCategory[];
  onChange: (type: string) => void;
};

export function PropertyTypePickerGrid({ value, categories, onChange }: PropertyTypePickerGridProps) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        No categories yet. Add one under Listing categories in the admin first.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map(({ value: type, label, iconGrey, iconBlue }) => {
        const selected = value === type;
        const icon = selected ? iconBlue : iconGrey;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={selected}
            className={`flex min-h-[8.5rem] flex-col items-center justify-center gap-3 rounded-md border px-4 py-6 transition ${
              selected
                ? "border-[#3A6696] bg-[#eef4fa] text-[#3A6696]"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            }`}
          >
            {icon ? (
              <Image
                src={icon}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="h-9 w-9 object-contain"
              />
            ) : null}
            <span className={`text-sm font-medium ${selected ? "text-[#3A6696]" : "text-slate-600"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
