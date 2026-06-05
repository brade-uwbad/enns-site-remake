import type { EditorState } from "@/components/admin/listings-editor/types";

type ListingDetailsFieldsProps = {
  form: EditorState;
  onSetField: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
};

/** Shared details form for create wizard and listing editor. */
export function ListingDetailsFields({ form, onSetField }: ListingDetailsFieldsProps) {
  return (
    <div className="grid gap-4">
      <label className="text-sm">
        <span className="mb-1 block">City</span>
        <input
          className="w-full rounded-sm border border-zinc-300 p-2"
          value={form.city}
          onChange={(e) => onSetField("city", e.target.value)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Province</span>
        <input
          className="w-full rounded-sm border border-zinc-300 p-2"
          value={form.province}
          onChange={(e) => onSetField("province", e.target.value)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Postal code</span>
        <input
          className="w-full rounded-sm border border-zinc-300 p-2"
          value={form.postalCode}
          onChange={(e) => onSetField("postalCode", e.target.value)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Address</span>
        <input
          className="w-full rounded-sm border border-zinc-300 p-2"
          value={form.addressLine}
          onChange={(e) => onSetField("addressLine", e.target.value)}
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Selling price (CAD)</span>
        <input
          type="number"
          min="0"
          step="0.01"
          className="w-full rounded-sm border border-zinc-300 p-2"
          value={form.priceDollars}
          onChange={(e) => onSetField("priceDollars", e.target.value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm">
          <span className="mb-1 block">Bedrooms</span>
          <input
            type="number"
            min="0"
            step="1"
            className="w-full rounded-sm border border-zinc-300 p-2"
            value={form.beds}
            onChange={(e) => onSetField("beds", e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block">Bathrooms</span>
          <input
            type="number"
            min="0"
            step="0.5"
            className="w-full rounded-sm border border-zinc-300 p-2"
            value={form.baths}
            onChange={(e) => onSetField("baths", e.target.value)}
          />
        </label>
      </div>
      <label className="text-sm">
        <span className="mb-1 block">Listing description</span>
        <textarea
          className="h-20 resize-none w-full rounded-sm border border-zinc-300 p-2"
          value={form.description}
          onChange={(e) => onSetField("description", e.target.value)}
        />
      </label>
    </div>
  );
}
