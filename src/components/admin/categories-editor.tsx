"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EditorToast } from "@/components/admin/listings-editor/editor-toast";
import {
  adminCardClass,
  adminLinkClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { useAdminUser } from "@/hooks/use-admin-user";
import type { ListingCategory } from "@/lib/listings/listing-categories";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";

const MAX_CATEGORIES = 12;
const INPUT_CLASS = "w-full rounded-sm border border-zinc-300 p-2 text-sm";

type CategoriesEditorProps = {
  initialCategories: ListingCategory[];
};

function emptyCategory(): ListingCategory {
  return { value: "", label: "", iconGrey: "", iconBlue: "" };
}

export function CategoriesEditor({ initialCategories }: CategoriesEditorProps) {
  const router = useRouter();
  const { accessToken } = useAdminUser();

  const [categories, setCategories] = useState<ListingCategory[]>(initialCategories);
  const [busy, setBusy] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  function updateCategory(index: number, patch: Partial<ListingCategory>) {
    setCategories((prev) => prev.map((cat, i) => (i === index ? { ...cat, ...patch } : cat)));
  }

  function addCategory() {
    setCategories((prev) => (prev.length >= MAX_CATEGORIES ? prev : [...prev, emptyCategory()]));
  }

  function removeCategory(index: number) {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }

  function moveCategory(index: number, direction: -1 | 1) {
    setCategories((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onUploadIcon(index: number, field: "iconGrey" | "iconBlue", file: File) {
    if (isSupabaseBrowserConfigured() && !accessToken) {
      setMessage("You must sign in as an admin before uploading.");
      return;
    }

    const key = `${index}-${field}`;
    setUploadingKey(key);
    setMessage("");
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/content/upload", { method: "POST", headers, body });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Could not upload icon.");
      }
      updateCategory(index, { [field]: data.data.url as string });
      setMessage("Icon uploaded. Click Save changes to publish it.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not upload icon.");
    } finally {
      setUploadingKey(null);
    }
  }

  async function onSave() {
    if (isSupabaseBrowserConfigured() && !accessToken) {
      setMessage("You must sign in as an admin before saving changes.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const res = await fetch("/api/admin/listings/categories", {
        method: "PUT",
        headers,
        body: JSON.stringify({ categories }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Could not save categories.");
      }
      // Reflect the server's normalized values (slugs, dropped blanks).
      setCategories(data.data.categories as ListingCategory[]);
      setMessage("Saved. Listings pages will update on the next visit.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save categories.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      {message ? <EditorToast message={message} onDismiss={() => setMessage("")} /> : null}
      <AdminPageHeader
        breadcrumb={
          <Link href="/admin/dashboard" className={adminLinkClass}>
            ← Back to dashboard
          </Link>
        }
        title="Listing categories"
        description="Add, remove, and rename the categories buyers filter by. Each can have a grey icon (shown when unselected) and a blue icon (shown when selected). Changes apply across the listings pages and the create form."
      />

      <div className="space-y-5">
        {categories.map((category, index) => (
          <div key={index} className={`${adminCardClass} p-4 sm:p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                Category {index + 1}
                {category.value ? (
                  <span className="ml-2 font-normal text-slate-500">({category.value})</span>
                ) : null}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveCategory(index, -1)}
                  disabled={index === 0}
                  className="rounded-sm border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveCategory(index, 1)}
                  disabled={index === categories.length - 1}
                  className="rounded-sm border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="ml-1 rounded-sm border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            </div>

            <label className="mt-4 block text-sm">
              <span className="mb-1 block">Name</span>
              <input
                type="text"
                value={category.label}
                placeholder="e.g. Leases"
                onChange={(e) => updateCategory(index, { label: e.target.value })}
                className={INPUT_CLASS}
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <IconField
                label="Icon — unselected (grey)"
                url={category.iconGrey}
                uploading={uploadingKey === `${index}-iconGrey`}
                onPick={(file) => void onUploadIcon(index, "iconGrey", file)}
              />
              <IconField
                label="Icon — selected (blue)"
                url={category.iconBlue}
                uploading={uploadingKey === `${index}-iconBlue`}
                onPick={(file) => void onUploadIcon(index, "iconBlue", file)}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addCategory}
        disabled={categories.length >= MAX_CATEGORIES}
        className={`${adminSecondaryButtonClass} w-full`}
      >
        {categories.length >= MAX_CATEGORIES ? `Maximum ${MAX_CATEGORIES} categories` : "+ Add category"}
      </button>

      <div className="flex flex-col-reverse gap-4 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/admin/listings" className="px-1 py-2 text-sm text-slate-500 hover:text-slate-800">
          Back to listings
        </Link>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={busy}
          className={`${adminPrimaryButtonClass} w-full sm:w-auto`}
        >
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function IconField({
  label,
  url,
  uploading,
  onPick,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onPick: (file: File) => void;
}) {
  return (
    <div className="text-sm">
      <span className="mb-1 block">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-zinc-300 bg-slate-100">
          {url ? (
            <Image src={url} alt="" fill sizes="56px" unoptimized className="object-contain p-2" />
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
              None
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onPick(file);
              }
              e.target.value = "";
            }}
            className="w-40 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#3A6696] file:px-2 file:py-1 file:text-white hover:file:bg-[#32587f]"
          />
          {uploading ? <span className="text-xs text-slate-500">Uploading…</span> : null}
        </div>
      </div>
    </div>
  );
}
