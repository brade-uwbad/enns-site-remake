"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EditorToast } from "@/components/admin/listings-editor/editor-toast";
import { SITE_CONTENT_PAGES } from "@/lib/content/keys";
import { SITE_CONTENT_EDITOR_FIELDS } from "@/lib/content/editor-fields";
import type { SiteContentKey } from "@/lib/content/keys";
import type { SiteContentPayload } from "@/lib/content/types";
import { useAdminUser } from "@/hooks/use-admin-user";
import { formatAdminDateTime } from "@/lib/format-admin-datetime";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";

const EDITOR_FIELD_INPUT_CLASS = "w-full rounded-sm border border-zinc-300 p-2";
const EDITOR_TITLE_CLASS =
  "text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl";
const EDITOR_DONE_BUTTON_CLASS =
  "rounded-md bg-[#3A6696] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#32587f] disabled:cursor-not-allowed disabled:opacity-60";
const EDITOR_BACK_LINK_CLASS = "px-1 py-2 text-sm text-slate-500 hover:text-slate-800";

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

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

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
      setMessage("Saved. Public pages should update on the next visit.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save content.");
    } finally {
      setBusy(false);
    }
  }

  const title = page?.label ?? pageKey;

  return (
    <>
      {message ? <EditorToast message={message} onDismiss={() => setMessage("")} /> : null}
      <div className="mx-auto flex h-[calc(100dvh-var(--site-header-offset)-3rem)] w-full min-h-0 max-w-3xl flex-col sm:h-[calc(100dvh-9rem)]">
      <header className="shrink-0">
        <h1 className={EDITOR_TITLE_CLASS}>{title}</h1>
        {page?.description ? (
          <p className="mt-3 text-center text-sm text-slate-600">{page.description}</p>
        ) : null}
        {updatedAt ? (
          <p className="mt-2 text-center text-xs text-slate-500">
            Last saved: {formatAdminDateTime(updatedAt, { withSeconds: true })}
          </p>
        ) : null}
        {page?.publicPath ? (
          <p className="mt-2 text-center text-sm">
            <Link
              href={page.publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
            >
              View public page
            </Link>
          </p>
        ) : null}
      </header>

      <form className="mt-8 flex min-h-0 flex-1 flex-col" onSubmit={(e) => void onSave(e)}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-4">
            {fields.map((field) => (
              <label key={field.name} className="text-sm">
                <span className="mb-1 block">{field.label}</span>
                {field.multiline ? (
                  <textarea
                    value={form[field.name] ?? ""}
                    onChange={(e) => setField(field.name, e.target.value)}
                    rows={4}
                    className={`${EDITOR_FIELD_INPUT_CLASS} min-h-20 resize-y`}
                  />
                ) : (
                  <input
                    type="text"
                    value={form[field.name] ?? ""}
                    onChange={(e) => setField(field.name, e.target.value)}
                    className={EDITOR_FIELD_INPUT_CLASS}
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-4 pb-6 pt-8 sm:flex-row sm:items-center sm:justify-between sm:pb-8 sm:pt-12">
          <Link href="/admin/content" className={EDITOR_BACK_LINK_CLASS}>
            Back
          </Link>
          <button type="submit" disabled={busy} className={`${EDITOR_DONE_BUTTON_CLASS} w-full sm:w-auto`}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
