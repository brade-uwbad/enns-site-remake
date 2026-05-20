import Image from "next/image";
import { useState } from "react";
import { LISTING_AMENITIES } from "@/lib/listings/listing-amenities";
import {
  PROPERTY_TYPE_LABEL,
  WIZARD_STEP_TITLES,
  type EditorState,
  type PropertyType,
} from "@/components/admin/listings-editor/types";

type Props = {
  wizardStep: number;
  busy: boolean;
  form: EditorState;
  existingPhotos: string[];
  selectedPhotos: Array<{ file: File; previewUrl: string }>;
  onSetField: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  onToggleAmenity: (id: (typeof LISTING_AMENITIES)[number]["id"]) => void;
  onAddUploadFiles: (files: FileList | null) => void;
  onRemoveQueuedPhoto: (index: number) => void;
  onRemoveExistingPhoto: (url: string) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onPublish: () => Promise<void>;
};

export function CreateWizard(props: Props) {
  const {
    wizardStep,
    busy,
    form,
    existingPhotos,
    selectedPhotos,
    onSetField,
    onToggleAmenity,
    onAddUploadFiles,
    onRemoveQueuedPhoto,
    onRemoveExistingPhoto,
    onPrevStep,
    onNextStep,
    onPublish,
  } = props;
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  return (
    <section className="space-y-6 rounded-lg border border-slate-300 bg-white p-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Create Listing - Step {wizardStep + 1} of 4
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          {WIZARD_STEP_TITLES[wizardStep]}
        </h2>
      </div>

      {wizardStep === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600">
            Select the property type that best describes the listing.
          </p>
          <div className="grid grid-cols-2 gap-3 md:max-w-xl">
            {(Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[]).map((type) => {
              const selectedType = form.propertyType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSetField("propertyType", type)}
                  className={`rounded-xl border px-4 py-5 text-left transition ${
                    selectedType
                      ? "border-sky-500 bg-sky-50 text-sky-900"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <p className="text-base font-semibold">{PROPERTY_TYPE_LABEL[type]}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {wizardStep === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block">City</span>
            <input className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.city} onChange={(e) => onSetField("city", e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Province</span>
            <input className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.province} onChange={(e) => onSetField("province", e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Postal code</span>
            <input className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.postalCode} onChange={(e) => onSetField("postalCode", e.target.value)} placeholder="e.g. M5V 2T6" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Address</span>
            <input className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.addressLine} onChange={(e) => onSetField("addressLine", e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Selling price (CAD)</span>
            <input type="number" step="0.01" min="0" className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.priceDollars} onChange={(e) => onSetField("priceDollars", e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Status</span>
            <select className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.status} onChange={(e) => onSetField("status", e.target.value as EditorState["status"])}>
              <option value="active">active</option>
              <option value="sold">sold</option>
              <option value="draft">draft</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Beds</span>
            <input type="number" min="0" step="1" className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.beds} onChange={(e) => onSetField("beds", e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Baths</span>
            <input type="number" min="0" step="0.5" className="w-full rounded-md border border-zinc-300 bg-white p-2" value={form.baths} onChange={(e) => onSetField("baths", e.target.value)} />
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block">Description</span>
            <textarea className="h-28 w-full rounded-md border border-zinc-300 bg-white p-2" value={form.description} onChange={(e) => onSetField("description", e.target.value)} />
          </label>
        </div>
      ) : null}

      {wizardStep === 2 ? (
        <div className="space-y-4">
          <div className="rounded-md border border-zinc-300 p-3">
            <input type="file" accept="image/*" multiple onChange={(e) => onAddUploadFiles(e.target.files)} className="block w-full text-sm" />
            <p className="mt-2 text-xs text-zinc-500">Selected photos upload when you click Publish.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
            {selectedPhotos.length === 0 && existingPhotos.length > 0
              ? existingPhotos.slice(0, 8).map((src) => (
                  <div key={src} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200">
                    <Image src={src} alt="Existing listing photo" fill className="object-cover" />
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
            <Image src={previewSrc} alt="Preview selected photo" fill className="object-contain" />
          </div>
        </div>
      ) : null}

      {wizardStep === 3 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-600">Select any amenities your listing includes.</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:max-w-2xl">
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
          onClick={onPrevStep}
          disabled={busy || wizardStep === 0}
          className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
        >
          Back
        </button>
        {wizardStep < WIZARD_STEP_TITLES.length - 1 ? (
          <button
            type="button"
            onClick={onNextStep}
            disabled={busy}
            className="rounded-md bg-[#2e6ea6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void onPublish()}
            disabled={busy}
            className="rounded-md bg-[#2e6ea6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Saving..." : "Publish"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {WIZARD_STEP_TITLES.map((label, i) => (
          <div
            key={label}
            className={`h-1.5 rounded-full ${i <= wizardStep ? "bg-[#2e6ea6]" : "bg-zinc-200"}`}
          />
        ))}
      </div>
    </section>
  );
}
