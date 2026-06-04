import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import type { Listing } from "@/components/admin/listings-editor/types";

type Props = {
  listings: Listing[];
  selectedId: string;
  busy: boolean;
  formStatus: Listing["status"];
  onChooseListing: (id: string) => void;
  onCreateNewListing: () => void;
  onDeleteListing: () => void;
  onMarkAsSold: () => void;
  onMarkAsActive: () => void;
};

export function TopControls(props: Props) {
  const {
    listings,
    selectedId,
    busy,
    formStatus,
    onChooseListing,
    onCreateNewListing,
    onDeleteListing,
    onMarkAsSold,
    onMarkAsActive,
  } = props;

  const selected = listings.find((l) => l.id === selectedId) ?? null;

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
        <h2 className="mb-3 font-medium text-[#140000]">Saved listings</h2>
        <select
          className="w-full rounded-sm border border-zinc-300 bg-white p-2 text-sm text-[#140000]"
          value={selectedId}
          onChange={(e) => onChooseListing(e.target.value)}
        >
          <option value="">Choose listing to edit</option>
          {listings.map((listing) => (
            <option key={listing.id} value={listing.id}>
              {listing.title} ({listing.status})
            </option>
          ))}
        </select>
        {selected ? <p className="mt-2 text-xs text-zinc-500">Editing id: {selected.id}</p> : null}
      </div>

      <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
        <h2 className="mb-3 font-medium text-[#140000]">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreateNewListing}
            disabled={busy}
            className={`${adminPrimaryButtonClass} px-3 py-2`}
          >
            Create new listing
          </button>
          <button
            type="button"
            onClick={onDeleteListing}
            disabled={busy || !selectedId}
            className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-60"
          >
            Delete
          </button>
          {formStatus === "sold" ? (
            <button
              type="button"
              onClick={onMarkAsActive}
              disabled={busy || !selectedId}
              className={`${adminSecondaryButtonClass} px-3 py-2`}
            >
              Mark as active
            </button>
          ) : (
            <button
              type="button"
              onClick={onMarkAsSold}
              disabled={busy || !selectedId}
              className={`${adminSecondaryButtonClass} px-3 py-2`}
            >
              Mark as sold
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
