import type { Listing } from "@/components/admin/listings-editor/types";

type Props = {
  listings: Listing[];
  selectedId: string;
  busy: boolean;
  formStatus: Listing["status"];
  message: string;
  onChooseListing: (id: string) => void;
  onCreateNewListing: () => void;
  onDeleteListing: () => void;
  onMarkAsSold: () => void;
};

export function TopControls(props: Props) {
  const {
    listings,
    selectedId,
    busy,
    formStatus,
    message,
    onChooseListing,
    onCreateNewListing,
    onDeleteListing,
    onMarkAsSold,
  } = props;

  const selected = listings.find((l) => l.id === selectedId) ?? null;

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border border-slate-300 bg-white p-4">
        <h2 className="mb-3 font-medium">Saved listings</h2>
        <select
          className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
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

      <div className="rounded-lg border border-slate-300 bg-white p-4">
        <h2 className="mb-3 font-medium">Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreateNewListing}
            disabled={busy}
            className="rounded-md bg-[#2e6ea6] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
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
          <button
            type="button"
            onClick={onMarkAsSold}
            disabled={busy || !selectedId || formStatus === "sold"}
            className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-zinc-800 disabled:opacity-60"
          >
            Mark as sold
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-zinc-700">{message}</p> : null}
      </div>
    </section>
  );
}
