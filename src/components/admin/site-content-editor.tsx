"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SITE_CONTENT_PAGES } from "@/lib/content/keys";
import { SITE_CONTENT_EDITOR_FIELDS } from "@/lib/content/editor-fields";
import type { SiteContentKey } from "@/lib/content/keys";
import type { SiteContentPayload } from "@/lib/content/types";
import { useAdminUser } from "@/hooks/use-admin-user";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";

type SiteContentEditorProps = {
  pageKey: SiteContentKey;
  initialPayload: SiteContentPayload<SiteContentKey>;
  updatedAt: string | null;
};

function payloadToFormState(payload: SiteContentPayload<SiteContentKey>) {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(payload)) {
    out[key] = typeof value === "string" ? value : "";
  }
  return out;
}

export function SiteContentEditor({ pageKey, initialPayload, updatedAt }: SiteContentEditorProps) {
  const router = useRouter();
  const { accessToken } = useAdminUser();
  const page = SITE_CONTENT_PAGES.find((p) => p.key === pageKey);
  const fields = SITE_CONTENT_EDITOR_FIELDS[pageKey];

  const [form, setForm] = useState(() => payloadToFormState(initialPayload));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function setField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
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

      const res = await fetch(`/api/admin/content/${pageKey}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Could not save content.");
      }
      setMessage("Saved. Refresh the public page to confirm.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save content.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6 rounded-lg border border-slate-300 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">
            <Link href="/admin/content" className="text-[#4a6d95] hover:underline">
              Site content
            </Link>
            {" / "}
            {page?.label ?? pageKey}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-[#140000]">{page?.label ?? pageKey}</h1>
          {page?.description ? <p className="mt-2 text-sm text-zinc-600">{page.description}</p> : null}
        </div>
        {page?.publicPath ? (
          <Link
            href={page.publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            View public page
          </Link>
        ) : null}
      </div>

      {updatedAt ? (
        <p className="text-xs text-zinc-500">
          Last saved: {new Date(updatedAt).toLocaleString()}
        </p>
      ) : null}

      <form className="space-y-4" onSubmit={(e) => void onSave(e)}>
        {fields.map((field) => (
          <label key={field.name} className="block space-y-1">
            <span className="text-sm font-medium text-zinc-800">{field.label}</span>
            {field.multiline ? (
              <textarea
                value={form[field.name] ?? ""}
                onChange={(e) => setField(field.name, e.target.value)}
                rows={4}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              />
            ) : (
              <input
                type="text"
                value={form[field.name] ?? ""}
                onChange={(e) => setField(field.name, e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              />
            )}
          </label>
        ))}

        {message ? (
          <p className={`text-sm ${message.startsWith("Saved") ? "text-emerald-700" : "text-red-600"}`}>
            {message}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[#4a6d95] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3f5f84] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
          <Link
            href="/admin/content"
            className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Back
          </Link>
        </div>
      </form>
    </section>
  );
}
