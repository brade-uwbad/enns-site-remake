import Image from "next/image";
import { useState } from "react";
import { LISTING_AMENITIES } from "@/lib/listings/listing-amenities";
import {
  type EditorPanel,
  type EditorState,
} from "@/components/admin/listings-editor/types";

type Props = {
  busy: boolean;
  editorPanel: EditorPanel;
  form: EditorState;
  existingPhotos: string[];
  selectedPhotos: Array<{ file: File; previewUrl: string }>;
  onSetPanel: (panel: EditorPanel) => void;
  onSetField: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  onToggleAmenity: (id: (typeof LISTING_AMENITIES)[number]["id"]) => void;
  onAddUploadFiles: (files: FileList | null) => void;
  onRemoveQueuedPhoto: (index: number) => void;
  onRemoveExistingPhoto: (url: string) => void;
  onSavePanel: () => Promise<void>;
};

export function EditWorkspace(props: Props) {
  const {
    busy,
    editorPanel,
    form,
    existingPhotos,
    selectedPhotos,
    onSetPanel,
    onSetField,
    onToggleAmenity,
    onAddUploadFiles,
    onRemoveQueuedPhoto,
    onRemoveExistingPhoto,
    onSavePanel,
  } = props;
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  return (
    <section className="space-y-6 rounded-lg border border-slate-300 bg-white p-5">
      {editorPanel === "menu" ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-center text-4xl font-semibold text-zinc-900">Listing Editor</h2>
          <button
            type="button"
            onClick={() => onSetPanel("photos")}
            className="w-full rounded-xl border border-zinc-300 p-4 text-left hover:border-sky-400"
          >
            <p className="text-lg font-semibold">Photos</p>
            <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-zinc-700">
              Add or edit images for the listing
            </p>
          </button>
          <button
            type="button"
            onClick={() => onSetPanel("details")}
            className="w-full rounded-xl border border-zinc-300 p-4 text-left hover:border-sky-400"
          >
            <p className="text-lg font-semibold">Details</p>
            <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-zinc-700">
              Edit listing address, price, and core details
            </p>
          </button>
          <button
            type="button"
            onClick={() => onSetPanel("amenities")}
            className="w-full rounded-xl border border-zinc-300 p-4 text-left hover:border-sky-400"
          >
            <p className="text-lg font-semibold">Amenities</p>
            <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-zinc-700">
              Edit what is included with the listing
            </p>
          </button>
        </div>
      ) : null}

      {editorPanel === "photos" ? (
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-center text-4xl font-semibold text-zinc-900">Editing listing photos</h2>
          <div className="rounded-md border border-zinc-300 p-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onAddUploadFiles(e.target.files)}
              className="block w-full text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedPhotos.map((item, index) => (
              <div key={item.previewUrl} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200">
                <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
                <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/45 group-hover:flex">
                  <button
                    type="button"
                    onClick={() => setPreviewSrc(item.previewUrl)}
                    className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-zinc-900"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveQueuedPhoto(index)}
                    className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {selectedPhotos.length === 0
              ? existingPhotos.slice(0, 6).map((src) => (
                  <div key={src} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200">
                    <Image src={src} alt="Existing listing photo" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 hidden items-center justify-center gap-2 bg-black/45 group-hover:flex">
                      <button
                        type="button"
                        onClick={() => setPreviewSrc(src)}
                        className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-zinc-900"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveExistingPhoto(src)}
                        className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}

      {editorPanel === "details" ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-center text-4xl font-semibold text-zinc-900">Edit listing details</h2>
          <div className="grid gap-4">
            <label className="text-sm">
              <span className="mb-1 block">City</span>
              <input className="w-full rounded-md border border-zinc-300 p-2" value={form.city} onChange={(e) => onSetField("city", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Province</span>
              <input className="w-full rounded-md border border-zinc-300 p-2" value={form.province} onChange={(e) => onSetField("province", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Postal code</span>
              <input className="w-full rounded-md border border-zinc-300 p-2" value={form.postalCode} onChange={(e) => onSetField("postalCode", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Address</span>
              <input className="w-full rounded-md border border-zinc-300 p-2" value={form.addressLine} onChange={(e) => onSetField("addressLine", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Selling price (CAD)</span>
              <input type="number" min="0" step="0.01" className="w-full rounded-md border border-zinc-300 p-2" value={form.priceDollars} onChange={(e) => onSetField("priceDollars", e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Listing description</span>
              <textarea className="h-28 w-full rounded-md border border-zinc-300 p-2" value={form.description} onChange={(e) => onSetField("description", e.target.value)} />
            </label>
          </div>
        </div>
      ) : null}

      {editorPanel === "amenities" ? (
        <div className="mx-auto max-w-3xl space-y-4">
          <h2 className="text-center text-4xl font-semibold text-zinc-900">Edit listing amenities</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {LISTING_AMENITIES.map(({ id, icon }) => {
              const checked = form.amenitySelections[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggleAmenity(id)}
                  className={`rounded-xl border px-4 py-4 transition ${
                    checked
                      ? "border-sky-500 bg-sky-50 text-sky-900"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <div className="mx-auto flex w-fit flex-col items-center gap-2 text-center">
                    <Image src={icon} alt="" width={28} height={28} unoptimized />
                    <span className="text-sm font-medium">{id}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
        <button
          type="button"
          onClick={() => onSetPanel("menu")}
          disabled={busy || editorPanel === "menu"}
          className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => {
            if (editorPanel !== "menu") {
              void onSavePanel();
            }
          }}
          disabled={busy || editorPanel === "menu"}
          className="rounded-md bg-[#2e6ea6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Saving..." : "Done"}
        </button>
      </div>
      {previewSrc ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute right-4 top-4 rounded bg-white px-3 py-1 text-sm font-medium text-zinc-900"
            onClick={() => setPreviewSrc(null)}
          >
            Close
          </button>
          <div className="relative h-[80vh] w-[90vw] max-w-5xl">
            <Image src={previewSrc} alt="Preview selected photo" fill className="object-contain" unoptimized />
          </div>
        </div>
      ) : null}
    </section>
  );
}
