"use client";

import { useEffect, useMemo, useState } from "react";

type Listing = {
  id: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  address_line1: string | null;
  price_cents: number | null;
  description: string | null;
  amenities: string[];
  images: string[];
  status: "active" | "sold" | "draft";
};

type EditorState = {
  title: string;
  subtitle: string;
  city: string;
  addressLine1: string;
  priceCents: string;
  description: string;
  amenitiesText: string;
  imagesText: string;
  status: "active" | "sold" | "draft";
};

const blankState: EditorState = {
  title: "",
  subtitle: "",
  city: "",
  addressLine1: "",
  priceCents: "",
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
    addressLine1: listing.address_line1 ?? "",
    priceCents: listing.price_cents != null ? String(listing.price_cents) : "",
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

export function ListingsEditor() {
  const [token, setToken] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [form, setForm] = useState<EditorState>(blankState);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const saved = window.localStorage.getItem("admin_access_token");
    if (saved) setToken(saved);
  }, []);

  async function loadListings() {
    const res = await fetch("/api/listings?limit=100");
    const data = await res.json();
    setListings(data?.data?.listings ?? []);
  }

  useEffect(() => {
    loadListings().catch(() => {
      setMessage("Failed to load listings.");
    });
  }, []);

  const selected = useMemo(() => listings.find((l) => l.id === selectedId) ?? null, [listings, selectedId]);

  function chooseListing(id: string) {
    setSelectedId(id);
    const listing = listings.find((l) => l.id === id);
    setForm(listing ? toEditorState(listing) : blankState);
  }

  function setField<K extends keyof EditorState>(key: K, value: EditorState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async function createListing() {
    setBusy(true);
    setMessage("");
    try {
      if (!token.trim()) {
        throw new Error("Access token is required.");
      }
      window.localStorage.setItem("admin_access_token", token.trim());
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        city: form.city || null,
        addressLine1: form.addressLine1 || null,
        priceCents: form.priceCents ? Number(form.priceCents) : null,
        description: form.description || null,
        amenities: splitList(form.amenitiesText),
        images: splitList(form.imagesText),
        status: form.status,
      };
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create listing.");

      setMessage("Listing created.");
      await loadListings();
      const id = data?.data?.listing?.id as string | undefined;
      if (id) chooseListing(id);
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
      if (!token.trim()) {
        throw new Error("Access token is required.");
      }
      window.localStorage.setItem("admin_access_token", token.trim());
      const payload = {
        title: form.title,
        subtitle: form.subtitle || null,
        city: form.city || null,
        addressLine1: form.addressLine1 || null,
        priceCents: form.priceCents ? Number(form.priceCents) : null,
        description: form.description || null,
        amenities: splitList(form.amenitiesText),
        images: splitList(form.imagesText),
        status: form.status,
      };
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update listing.");
      setMessage("Listing updated.");
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
      if (!token.trim()) {
        throw new Error("Access token is required.");
      }
      window.localStorage.setItem("admin_access_token", token.trim());
      const res = await fetch(`/api/admin/listings/${selectedId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to delete listing.");
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
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Admin listings</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Create, update, and delete listings without terminal commands.
      </p>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <label className="mb-2 block text-sm font-medium">Supabase user access token</label>
        <textarea
          className="h-20 w-full rounded-md border border-zinc-300 bg-white p-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste access token (JWT)"
        />
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
              value={form.addressLine1}
              onChange={(e) => setField("addressLine1", e.target.value)}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block">Selling price (cents)</span>
            <input
              type="number"
              className="w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
              value={form.priceCents}
              onChange={(e) => setField("priceCents", e.target.value)}
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
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Photo URLs (one per line)</span>
          <textarea
            className="h-32 w-full rounded-md border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900"
            value={form.imagesText}
            onChange={(e) => setField("imagesText", e.target.value)}
          />
        </label>
      </section>
    </div>
  );
}
