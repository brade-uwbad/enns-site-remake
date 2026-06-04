import Image from "next/image";

import type { PropertyType } from "@/components/admin/listings-editor/types";
import { PROPERTY_TYPE_OPTIONS } from "@/lib/listings/property-type-options";

type PropertyTypePickerGridProps = {
  value: "" | PropertyType;
  onChange: (type: PropertyType) => void;
};

export function PropertyTypePickerGrid({ value, onChange }: PropertyTypePickerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {PROPERTY_TYPE_OPTIONS.map(({ value: type, label, iconGrey, iconBlue }) => {
        const selected = value === type;
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
            <Image
              src={selected ? iconBlue : iconGrey}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="h-9 w-9 object-contain"
            />
            <span className={`text-sm font-medium ${selected ? "text-[#3A6696]" : "text-slate-600"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
