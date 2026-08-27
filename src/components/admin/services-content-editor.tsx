"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ADMIN_IMAGE_UPLOAD_FORMAT_HINT } from "@/components/admin/image-upload-hint";
import { EditorToast } from "@/components/admin/listings-editor/editor-toast";
import {
  adminCardClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/admin-ui";
import { useAdminUser } from "@/hooks/use-admin-user";
import { formatAdminDateTime } from "@/lib/format-admin-datetime";
import type { ServiceCard, ServicesContent } from "@/lib/content/types";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";

const MAX_SERVICES = 8;
const INPUT_CLASS = "w-full rounded-sm border border-zinc-300 p-2 text-sm";
const TITLE_CLASS = "text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl";

type ServicesContentEditorProps = {
  initialPayload: ServicesContent;
  updatedAt: string | null;
};

function emptyCard(): ServiceCard {
  return { title: "", body: "", iconUrl: "" };
}

export function ServicesContentEditor({ initialPayload, updatedAt }: ServicesContentEditorProps) {
  const router = useRouter();
  const { accessToken } = useAdminUser();

  const [heroTitle, setHeroTitle] = useState(initialPayload.heroTitle);
  const [heroDescription, setHeroDescription] = useState(initialPayload.heroDescription);
  const [services, setServices] = useState<ServiceCard[]>(initialPayload.services);
  const [busy, setBusy] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = window.setTimeout(() => setMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  function updateCard(index: number, patch: Partial<ServiceCard>) {
    setServices((prev) => prev.map((card, i) => (i === index ? { ...card, ...patch } : card)));
  }

  function addCard() {
    setServices((prev) => (prev.length >= MAX_SERVICES ? prev : [...prev, emptyCard()]));
  }

  function removeCard(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function moveCard(index: number, direction: -1 | 1) {
    setServices((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onUploadIcon(index: number, file: File) {
    if (isSupabaseBrowserConfigured() && !accessToken) {
      setMessage("You must sign in as an admin before uploading.");
      return;
    }

    setUploadingIndex(index);
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
      updateCard(index, { iconUrl: data.data.url as string });
      setMessage("Icon uploaded. Click Save changes to publish it.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not upload icon.");
    } finally {
      setUploadingIndex(null);
    }
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

      const res = await fetch("/api/admin/content/services", {
        method: "PUT",
        headers,
        body: JSON.stringify({ heroTitle, heroDescription, services }),
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

  return (
    <>
      {message ? <EditorToast message={message} onDismiss={() => setMessage("")} /> : null}
      <div className="mx-auto w-full max-w-3xl">
        <header>
          <h1 className={TITLE_CLASS}>Services</h1>
          <p className="mt-3 text-center text-sm text-slate-600">
            Edit the intro and the service cards. Add or remove cards — up to {MAX_SERVICES}. The
            page shows up to 4 per row, then wraps to a new row.
          </p>
          {updatedAt ? (
            <p className="mt-2 text-center text-xs text-slate-500">
              Last saved: {formatAdminDateTime(updatedAt, { withSeconds: true })}
            </p>
          ) : null}
          <p className="mt-2 text-center text-sm">
            <Link
              href="/services"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline"
            >
              View public page
            </Link>
          </p>
        </header>

        <form className="mt-8" onSubmit={(e) => void onSave(e)}>
          <div className="grid gap-4">
            <label className="text-sm">
              <span className="mb-1 block">Page title</span>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className={INPUT_CLASS}
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block">Intro</span>
              <textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                rows={3}
                className={`${INPUT_CLASS} min-h-20 resize-y`}
              />
            </label>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Service cards</h2>
            <span className="text-xs text-slate-500">
              {services.length}/{MAX_SERVICES}
            </span>
          </div>

          <div className="mt-4 space-y-5">
            {services.map((card, index) => (
              <div key={index} className={`${adminCardClass} p-4 sm:p-5`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Service {index + 1}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveCard(index, -1)}
                      disabled={index === 0}
                      className="rounded-sm border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      aria-label="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCard(index, 1)}
                      disabled={index === services.length - 1}
                      className="rounded-sm border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCard(index)}
                      className="ml-1 rounded-sm border border-red-300 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex flex-col gap-2">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-300 bg-slate-100">
                      {card.iconUrl ? (
                        <Image
                          src={card.iconUrl}
                          alt=""
                          fill
                          sizes="80px"
                          unoptimized
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
                          No icon
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingIndex === index}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void onUploadIcon(index, file);
                        }
                        e.target.value = "";
                      }}
                      className="w-40 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#3A6696] file:px-2 file:py-1 file:text-white hover:file:bg-[#32587f]"
                    />
                    <p className="text-xs text-slate-500">
                      {uploadingIndex === index ? "Uploading…" : ADMIN_IMAGE_UPLOAD_FORMAT_HINT}
                    </p>
                  </div>

                  <div className="flex-1 space-y-3">
                    <label className="block text-sm">
                      <span className="mb-1 block">Title</span>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => updateCard(index, { title: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-1 block">Description</span>
                      <textarea
                        value={card.body}
                        onChange={(e) => updateCard(index, { body: e.target.value })}
                        rows={3}
                        className={`${INPUT_CLASS} min-h-20 resize-y`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCard}
            disabled={services.length >= MAX_SERVICES}
            className={`${adminSecondaryButtonClass} mt-5 w-full`}
          >
            {services.length >= MAX_SERVICES ? `Maximum ${MAX_SERVICES} services` : "+ Add service"}
          </button>

          <div className="flex flex-col-reverse gap-4 pb-8 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/admin/content"
              className="px-1 py-2 text-sm text-slate-500 hover:text-slate-800"
            >
              Back
            </Link>
            <button type="submit" disabled={busy} className={`${adminPrimaryButtonClass} w-full sm:w-auto`}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
