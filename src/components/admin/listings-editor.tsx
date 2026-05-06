"use client";

import { useState } from "react";

type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  address_line: string | null;
  price_dollars: number | null;
  description: string | null;
  amenities: string[];
  images: string[];
  status: "active" | "sold" | "draft";
};

type EditorState = {
  title: string;
  subtitle: string;
  city: string;
  addressLine: string;
  priceDollars: string;
  description: string;
  amenitiesText: string;
  imagesText: string;
  status: "active" | "sold" | "draft";
};

const blankState: EditorState = {
  title: "",
  subtitle: "",
  city: "",
  addressLine: "",
  priceDollars: "",
  description: "",
  amenitiesText: "",
  imagesText: "",
  status: "active",
};

function toEditorState(listing: Listing): EditorState {
  return {
    title: listing.title ?? "",
    subtitle: listing.subtitle ?? "",
    city: listing.city ?? "",
    addressLine: listing.address_line ?? "",
    priceDollars:
      listing.price_dollars === null || listing.price_dollars === undefined
        ? ""
        : String(listing.price_dollars),
    description: listing.description ?? "",
    amenitiesText: (listing.amenities ?? []).join(", "),
    imagesText: (listing.images ?? []).join("\n"),
    status: listing.status,
  };
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

export function ListingsEditor({ initialListings }: ListingsEditorProps) {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.localStorage.getItem("admin_access_token") ?? "";
  });
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<EditorState>(blankState);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);

  async function loadListings() {
    const res = await fetch("/api/listings?limit=100");
    const data = await res.json();
    setListings(data?.data?.listings ?? []);
  }

  const selected = listings.find((l) => l.id === selectedId) ?? null;

  function chooseListing(id: string) {
    setSelectedId(id);
    const listing = listings.find((l) => l.id === id);
    setForm(listing ? toEditorState(listing) : blankState);
  }

  function setField<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function authHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }
    return headers;
  }

  function uploadHeadersForMultipart() {
    return token.trim() ? { Authorization: `Bearer ${token.trim()}` } : undefined;
  }

  /**
   * Uploads selected files from the file input into Storage and appends URLs to imagesText.
   * No-op if no files chosen. Returns the merged image URL list for the save payload (state may lag otherwise).
   */
  async function uploadSelectedFilesIntoFormImages(existingImagesText: string): Promise<string[]> {
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
      if (token.trim()) {
        window.localStorage.setItem("admin_access_token", token.trim());
      }
      const images = await uploadSelectedFilesIntoFormImages(form.imagesText);
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        city: form.city || null,
        addressLine: form.addressLine || null,
        priceDollars: form.priceDollars ? Number(form.priceDollars) : null,
        description: form.description || null,
        amenities: splitList(form.amenitiesText),
        images,
        status: form.status,
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
      if (token.trim()) {
        window.localStorage.setItem("admin_access_token", token.trim());
      }
      const images = await uploadSelectedFilesIntoFormImages(form.imagesText);
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        city: form.city || null,
        addressLine: form.addressLine || null,
        priceDollars: form.priceDollars ? Number(form.priceDollars) : null,
        description: form.description || null,
        amenities: splitList(form.amenitiesText),
        images,
        status: form.status,
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
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to update listing.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteListing() {
    if (!selectedId) {
      setMessage("Pick a listing first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (token.trim()) {
        window.localStorage.setItem("admin_access_token", token.trim());
      }
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "DELETE",
        headers: token.trim() ? { Authorization: `Bearer ${token.trim()}` } : undefined,
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

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Admin listings
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Create, update, and delete listings without terminal commands.
      </p>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="mb-2 block text-sm font-medium">Access token (optional)</label>
        <textarea
          className="h-20 w-full rounded-md border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Leave blank when ADMIN_UI_BYPASS_AUTH=true"
        />
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          If server bypass mode is enabled, you can leave this empty.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 font-medium">Saved listings</h2>
          <select
            className="w-full rounded-md border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            value={selectedId}
            onChange={(e) => chooseListing(e.target.value)}
          >
            <option value="">New listing</option>
            {listings.map((listing) => (
              <option key={listing.id} value={listing.id}>
                {listing.title} ({listing.status})
              </option>
            ))}
          </select>
          {selected && <p className="mt-2 text-xs text-zinc-500">Editing id: {selected.id}</p>}
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-3 font-medium">Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={createListing}
              disabled={busy}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Create
            </button>
            <button
              type="button"
              onClick={updateListing}
              disabled={busy || !selectedId}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-700"
            >
              Update
            </button>
            <button
              type="button"
              onClick={deleteListing}
              disabled={busy || !selectedId}
              className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-60 dark:border-red-700 dark:text-red-300"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedId("");
                setForm(blankState);
              }}
              disabled={busy}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-700"
            >
              Reset form
            </button>
          </div>
          {message && <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{message}</p>}
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="font-medium">Edit listing details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block">Title</span>
            <input
              className="w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Subtitle</span>
            <input
              className="w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              value={form.subtitle}
              onChange={(e) => setField("subtitle", e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">City</span>
            <input
              className="w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              value={form.city}
              onChange={(e) => setField("city", e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Address</span>
            <input
              className="w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              value={form.addressLine}
              onChange={(e) => setField("addressLine", e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Selling price (dollars)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              value={form.priceDollars}
              onChange={(e) => setField("priceDollars", e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Status</span>
            <select
              className="w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              value={form.status}
              onChange={(e) => setField("status", e.target.value as EditorState["status"])}
            >
              <option value="active">active</option>
              <option value="sold">sold</option>
              <option value="draft">draft</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block">Description</span>
          <textarea
            className="h-28 w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </label>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Amenities (comma or newline separated)</span>
          <textarea
            className="h-32 w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={form.amenitiesText}
            onChange={(e) => setField("amenitiesText", e.target.value)}
          />
        </label>
        <div className="block text-sm">
          <span className="mb-1 block font-medium">Photos</span>
          <div className="space-y-2 rounded-md border border-zinc-300 p-3 dark:border-zinc-700">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setUploadFiles(e.target.files)}
              className="block w-full text-sm"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Selected photos upload automatically when you click Create or Update.
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Stored images: {splitList(form.imagesText).length}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
