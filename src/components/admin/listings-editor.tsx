"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  LISTING_AMENITIES,
  amenitiesArrayFromSelections,
  amenitySelectionsFromStored,
  emptyAmenitySelections,
  type ListingAmenityLabel,
  type ListingAmenitySelections,
} from "@/lib/listings/listing-amenities";

type PropertyType = "apartment" | "detached" | "townhouse" | "condo";

type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  address_line: string | null;
  price_dollars: number | null;
  description: string | null;
  amenities: string[];
  images: string[];
  status: "active" | "sold" | "draft";
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  property_type: PropertyType | null;
};

type EditorState = {
  city: string;
  province: string;
  postalCode: string;
  addressLine: string;
  priceDollars: string;
  description: string;
  amenitySelections: ListingAmenitySelections;
  imagesText: string;
  status: "active" | "sold" | "draft";
  beds: string;
  baths: string;
  sqft: string;
  propertyType: "" | PropertyType;
};

const blankState: EditorState = {
  city: "",
  province: "",
  postalCode: "",
  addressLine: "",
  priceDollars: "",
  description: "",
  amenitySelections: emptyAmenitySelections(),
  imagesText: "",
  status: "active",
  beds: "",
  baths: "",
  sqft: "",
  propertyType: "",
};

const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  apartment: "Apartment",
  detached: "Detached",
  townhouse: "Townhouse",
  condo: "Condo",
};

function deriveSubtitle(form: EditorState): string | null {
  const parts = [
    form.beds.trim() ? `${form.beds.trim()} Bed` : null,
    form.baths.trim() ? `${form.baths.trim()} Bath` : null,
    form.propertyType ? PROPERTY_TYPE_LABEL[form.propertyType] : null,
    form.city.trim() ? `in ${form.city.trim()}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : null;
}

function toEditorState(listing: Listing): EditorState {
  return {
    city: listing.city ?? "",
    province: listing.province ?? "",
    postalCode: listing.postal_code ?? "",
    addressLine: listing.address_line ?? "",
    priceDollars:
      listing.price_dollars === null || listing.price_dollars === undefined
        ? ""
        : String(listing.price_dollars),
    description: listing.description ?? "",
    amenitySelections: amenitySelectionsFromStored(listing.amenities ?? []),
    imagesText: (listing.images ?? []).join("\n"),
    status: listing.status,
    beds: listing.beds === null || listing.beds === undefined ? "" : String(listing.beds),
    baths: listing.baths === null || listing.baths === undefined ? "" : String(listing.baths),
    sqft: listing.sqft === null || listing.sqft === undefined ? "" : String(listing.sqft),
    propertyType: listing.property_type ?? "",
  };
}

function parseIntOrNull(s: string): number | null {
  if (!s.trim()) {
    return null;
  }
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function parseFloatOrNull(s: string): number | null {
  if (!s.trim()) {
    return null;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function splitList(text: string) {
  return text
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

type ListingsEditorProps = {
  initialListings: Listing[];
};

const WIZARD_STEP_TITLES = [
  "Property Type",
  "Listing Details",
  "Photos",
  "Amenities",
] as const;

type EditorPanel = "menu" | "photos" | "details" | "amenities";

export function ListingsEditor({ initialListings }: ListingsEditorProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<EditorState>(blankState);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const [editorPanel, setEditorPanel] = useState<EditorPanel>("menu");

  async function loadListings() {
    const [activeRes, soldRes] = await Promise.all([
      fetch("/api/listings?limit=100"),
      fetch("/api/listings/sold?limit=100"),
    ]);
    const [activeData, soldData] = await Promise.all([activeRes.json(), soldRes.json()]);
    setListings([...(activeData?.data?.listings ?? []), ...(soldData?.data?.listings ?? [])]);
  }

  const selected = listings.find((l) => l.id === selectedId) ?? null;
  const isEditing = Boolean(selectedId);
  const selectedPhotos = useMemo(
    () => Array.from(uploadFiles ?? []).map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) })),
    [uploadFiles],
  );
  const existingPhotos = splitList(form.imagesText);

  useEffect(() => {
    return () => {
      selectedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [selectedPhotos]);

  function chooseListing(id: string) {
    setSelectedId(id);
    const listing = listings.find((l) => l.id === id);
    setForm(listing ? toEditorState(listing) : blankState);
    setWizardStep(0);
    setEditorPanel("menu");
    setUploadFiles(null);
  }

  function setField<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleAmenity(id: ListingAmenityLabel) {
    setForm((prev) => ({
      ...prev,
      amenitySelections: {
        ...prev.amenitySelections,
        [id]: !prev.amenitySelections[id],
      },
    }));
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  function uploadHeadersForMultipart() {
    return undefined;
  }

  /**
   * Uploads selected files from the file input into Storage and appends URLs to imagesText.
   * No-op if no files chosen. Returns the merged image URL list for the save payload (state may lag otherwise).
   */
  async function uploadSelectedFilesIntoFormImages(
    existingImagesText: string,
  ): Promise<string[]> {
    if (!uploadFiles || uploadFiles.length === 0) {
      return splitList(existingImagesText);
    }
    const uploadedUrls: string[] = [];
    for (const file of Array.from(uploadFiles)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/listings/upload", {
        method: "POST",
        headers: uploadHeadersForMultipart(),
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? `Failed to upload ${file.name}`);
      }
      if (data?.data?.url) {
        uploadedUrls.push(data.data.url as string);
      }
    }
    const merged = [...splitList(existingImagesText), ...uploadedUrls];
    if (uploadedUrls.length > 0) {
      setField("imagesText", merged.join("\n"));
      setUploadFiles(null);
    }
    return merged;
  }

  async function createListing() {
    setBusy(true);
    setMessage("");
    try {
      const hadPendingUpload = Boolean(uploadFiles?.length);
      const images = await uploadSelectedFilesIntoFormImages(form.imagesText);
      const address = form.addressLine.trim();
      if (!address) {
        throw new Error("Address is required (it is used as the listing title).");
      }
      const postalCode = form.postalCode.trim();
      if (!postalCode) {
        throw new Error("Postal code is required.");
      }
      const payload = {
        title: address,
        subtitle: deriveSubtitle(form),
        city: form.city || null,
        province: form.province || null,
        postalCode,
        addressLine: address,
        priceDollars: form.priceDollars ? Number(form.priceDollars) : null,
        description: form.description || null,
        amenities: amenitiesArrayFromSelections(form.amenitySelections),
        images,
        status: form.status,
        beds: parseIntOrNull(form.beds),
        baths: parseFloatOrNull(form.baths),
        sqft: parseIntOrNull(form.sqft),
        propertyType: form.propertyType || null,
      };
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to create listing.");
      }

      setMessage(hadPendingUpload ? "Uploaded image(s); listing created." : "Listing created.");
      await loadListings();
      const id = data?.data?.listing?.id as string | undefined;
      if (id) {
        chooseListing(id);
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to create listing.");
    } finally {
      setBusy(false);
    }
  }

  async function updateListing() {
    if (!selectedId) {
      setMessage("Pick a listing first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const hadPendingUpload = Boolean(uploadFiles?.length);
      const images = await uploadSelectedFilesIntoFormImages(form.imagesText);
      const address = form.addressLine.trim();
      if (!address) {
        throw new Error("Address is required (it is used as the listing title).");
      }
      const postalCode = form.postalCode.trim();
      if (!postalCode) {
        throw new Error("Postal code is required.");
      }
      const payload = {
        title: address,
        subtitle: deriveSubtitle(form),
        city: form.city || null,
        province: form.province || null,
        postalCode,
        addressLine: address,
        priceDollars: form.priceDollars ? Number(form.priceDollars) : null,
        description: form.description || null,
        amenities: amenitiesArrayFromSelections(form.amenitySelections),
        images,
        status: form.status,
        beds: parseIntOrNull(form.beds),
        baths: parseFloatOrNull(form.baths),
        sqft: parseIntOrNull(form.sqft),
        propertyType: form.propertyType || null,
      };
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to update listing.");
      }
      setMessage(hadPendingUpload ? "Uploaded image(s); listing updated." : "Listing updated.");
      await loadListings();
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update listing.");
    } finally {
      setBusy(false);
    }
    return false;
  }

  async function deleteListing() {
    if (!selectedId) {
      setMessage("Pick a listing first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to delete listing.");
      }
      setMessage("Listing deleted.");
      setSelectedId("");
      setForm(blankState);
      await loadListings();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to delete listing.");
    } finally {
      setBusy(false);
    }
  }

  async function markAsSold() {
    if (!selectedId) {
      setMessage("Pick a listing first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          status: "sold",
          soldAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Failed to mark listing as sold.");
      }
      setMessage("Listing marked as sold.");
      await loadListings();
      setForm((prev) => ({ ...prev, status: "sold" }));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to mark listing as sold.");
    } finally {
      setBusy(false);
    }
  }

  function resetToNew() {
    setSelectedId("");
    setForm(blankState);
    setUploadFiles(null);
    setWizardStep(0);
    setEditorPanel("menu");
  }

  function nextStep() {
    if (wizardStep >= WIZARD_STEP_TITLES.length - 1) {
      return;
    }
    setWizardStep((prev) => prev + 1);
  }

  function prevStep() {
    if (wizardStep <= 0) {
      return;
    }
    setWizardStep((prev) => prev - 1);
  }

  async function saveFromWizard() {
    await createListing();
  }

  async function saveEditorPanel() {
    const ok = await updateListing();
    if (ok) {
      setEditorPanel("menu");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 text-[#140000] sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Admin listings
      </h1>
      <p className="text-sm text-zinc-600">
        Create, update, and delete listings without terminal commands.
      </p>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <h2 className="mb-3 font-medium">Saved listings</h2>
          <select
            className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
            value={selectedId}
            onChange={(e) => chooseListing(e.target.value)}
          >
            <option value="">Choose listing to edit</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.title} ({listing.status})
              </option>
            ))}
          </select>
          {selected && <p className="mt-2 text-xs text-zinc-500">Editing id: {selected.id}</p>}
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-4">
          <h2 className="mb-3 font-medium">Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetToNew}
              disabled={busy}
              className="rounded-md bg-[#2e6ea6] px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Create new listing
            </button>
            <button
              type="button"
              onClick={deleteListing}
              disabled={busy || !selectedId}
              className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-60"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={markAsSold}
              disabled={busy || !selectedId || form.status === "sold"}
              className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-zinc-800 disabled:opacity-60"
            >
              Mark as sold
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-zinc-700">{message}</p>}
        </div>
      </section>

      {!isEditing ? (
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
                    onClick={() => setField("propertyType", type)}
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
              <input
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.city}
                onChange={(e) => setField("city", e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Province</span>
              <input
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.province}
                onChange={(e) => setField("province", e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Postal code</span>
              <input
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.postalCode}
                onChange={(e) => setField("postalCode", e.target.value)}
                placeholder="e.g. M5V 2T6"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Address</span>
              <input
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.addressLine}
                onChange={(e) => setField("addressLine", e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Selling price (CAD)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.priceDollars}
                onChange={(e) => setField("priceDollars", e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Status</span>
              <select
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.status}
                onChange={(e) => setField("status", e.target.value as EditorState["status"])}
              >
                <option value="active">active</option>
                <option value="sold">sold</option>
                <option value="draft">draft</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Beds</span>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.beds}
                onChange={(e) => setField("beds", e.target.value)}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Baths</span>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.baths}
                onChange={(e) => setField("baths", e.target.value)}
              />
            </label>
            <label className="text-sm md:col-span-2">
              <span className="mb-1 block">Description</span>
              <textarea
                className="h-28 w-full rounded-md border border-zinc-300 bg-white p-2"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </label>
          </div>
          ) : null}

          {wizardStep === 2 ? (
          <div className="space-y-4">
            <div className="rounded-md border border-zinc-300 p-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setUploadFiles(e.target.files)}
                className="block w-full text-sm"
              />
              <p className="mt-2 text-xs text-zinc-500">
                Selected photos upload when you click {isEditing ? "Save" : "Publish"}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {selectedPhotos.map((item) => (
                <div
                  key={item.previewUrl}
                  className="relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200"
                >
                  <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
                </div>
              ))}
              {selectedPhotos.length === 0 && existingPhotos.length > 0
                ? existingPhotos.slice(0, 8).map((src) => (
                    <div
                      key={src}
                      className="relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200"
                    >
                      <Image src={src} alt="Existing listing photo" fill className="object-cover" unoptimized />
                    </div>
                  ))
                : null}
            </div>
          </div>
          ) : null}

          {wizardStep === 3 ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">
              Select any amenities your listing includes.
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:max-w-2xl">
              {LISTING_AMENITIES.map(({ id, icon }) => {
                const checked = form.amenitySelections[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAmenity(id)}
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
              onClick={prevStep}
              disabled={busy || wizardStep === 0}
              className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
            >
              Back
            </button>
            {wizardStep < WIZARD_STEP_TITLES.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={busy}
                className="rounded-md bg-[#2e6ea6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={saveFromWizard}
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
      ) : (
        <section className="space-y-6 rounded-lg border border-slate-300 bg-white p-5">
          {editorPanel === "menu" ? (
            <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-center text-4xl font-semibold text-zinc-900">Listing Editor</h2>
              <button
                type="button"
                onClick={() => setEditorPanel("photos")}
                className="w-full rounded-xl border border-zinc-300 p-4 text-left hover:border-sky-400"
              >
                <p className="text-lg font-semibold">Photos</p>
                <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-zinc-700">Add or edit images for the listing</p>
              </button>
              <button
                type="button"
                onClick={() => setEditorPanel("details")}
                className="w-full rounded-xl border border-zinc-300 p-4 text-left hover:border-sky-400"
              >
                <p className="text-lg font-semibold">Details</p>
                <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-zinc-700">Edit listing address, price, and core details</p>
              </button>
              <button
                type="button"
                onClick={() => setEditorPanel("amenities")}
                className="w-full rounded-xl border border-zinc-300 p-4 text-left hover:border-sky-400"
              >
                <p className="text-lg font-semibold">Amenities</p>
                <p className="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-zinc-700">Edit what is included with the listing</p>
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
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="block w-full text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedPhotos.map((item) => (
                  <div key={item.previewUrl} className="relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200">
                    <Image src={item.previewUrl} alt={item.file.name} fill className="object-cover" />
                  </div>
                ))}
                {selectedPhotos.length === 0
                  ? existingPhotos.slice(0, 6).map((src) => (
                      <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-md border border-zinc-200">
                        <Image src={src} alt="Existing listing photo" fill className="object-cover" unoptimized />
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
                  <input className="w-full rounded-md border border-zinc-300 p-2" value={form.city} onChange={(e) => setField("city", e.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block">Province</span>
                  <input className="w-full rounded-md border border-zinc-300 p-2" value={form.province} onChange={(e) => setField("province", e.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block">Postal code</span>
                  <input className="w-full rounded-md border border-zinc-300 p-2" value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block">Address</span>
                  <input className="w-full rounded-md border border-zinc-300 p-2" value={form.addressLine} onChange={(e) => setField("addressLine", e.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block">Selling price (CAD)</span>
                  <input type="number" min="0" step="0.01" className="w-full rounded-md border border-zinc-300 p-2" value={form.priceDollars} onChange={(e) => setField("priceDollars", e.target.value)} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block">Listing description</span>
                  <textarea className="h-28 w-full rounded-md border border-zinc-300 p-2" value={form.description} onChange={(e) => setField("description", e.target.value)} />
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
                      onClick={() => toggleAmenity(id)}
                      className={`rounded-xl border px-4 py-4 transition ${
                        checked ? "border-sky-500 bg-sky-50 text-sky-900" : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
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
              onClick={() => (editorPanel === "menu" ? resetToNew() : setEditorPanel("menu"))}
              disabled={busy}
              className="rounded-md px-3 py-2 text-sm text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => (editorPanel === "menu" ? undefined : saveEditorPanel())}
              disabled={busy || editorPanel === "menu"}
              className="rounded-md bg-[#2e6ea6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {busy ? "Saving..." : "Done"}
            </button>
          </div>
        </section>
      )}
      </div>
    </div>
  );
}
