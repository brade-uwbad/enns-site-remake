"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminUser } from "@/hooks/use-admin-user";
import { ABOUT_FEATURED_REVIEW_LIMIT } from "@/lib/reviews/constants";
import type { ReviewRow } from "@/lib/store/types";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/public-config";

type ReviewsManagerProps = {
  initialReviews: ReviewRow[];
};

type DraftReview = {
  title: string;
  authorName: string;
  body: string;
};

const emptyDraft: DraftReview = { title: "", authorName: "", body: "" };

export function ReviewsManager({ initialReviews }: ReviewsManagerProps) {
  const router = useRouter();
  const { accessToken } = useAdminUser();
  const [reviews, setReviews] = useState(initialReviews);
  const [draft, setDraft] = useState<DraftReview>(emptyDraft);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const featuredCount = useMemo(
    () => reviews.filter((r) => r.is_featured && r.is_visible).length,
    [reviews],
  );

  function authHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
  }

  async function apiPatch(id: string, body: Record<string, unknown>) {
    if (isSupabaseBrowserConfigured() && !accessToken) {
      throw new Error("You must sign in as an admin before saving changes.");
    }

    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message ?? "Could not save review.");
    }
    return data.data.review as ReviewRow;
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: draft.title,
          authorName: draft.authorName,
          body: draft.body,
          isVisible: true,
          isFeatured: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Could not create review.");
      }
      setReviews((prev) => [data.data.review as ReviewRow, ...prev]);
      setDraft(emptyDraft);
      setMessage("Review added to your library.");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create review.");
    } finally {
      setCreating(false);
    }
  }

  async function patchReview(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    setMessage("");
    try {
      const updated = await apiPatch(id, body);
      setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save review.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: string) {
    if (!window.confirm("Delete this review permanently?")) {
      return;
    }
    setBusyId(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message ?? "Could not delete review.");
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not delete review.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-zinc-500">
          <Link href="/admin/dashboard" className="text-[#4a6d95] hover:underline">
            Dashboard
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Client reviews</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Build a library of testimonials. Choose up to {ABOUT_FEATURED_REVIEW_LIMIT} to feature on the
          About page ({featuredCount}/{ABOUT_FEATURED_REVIEW_LIMIT} selected). Use display order to control
          left-to-right placement.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Public preview:{" "}
          <Link href="/about" className="font-medium text-[#4a6d95] hover:underline" target="_blank">
            /about
          </Link>
        </p>
      </div>

      {message ? (
        <p className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">{message}</p>
      ) : null}

      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-zinc-900">Add review</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Headline</span>
            <Input
              className="mt-1"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Honest and Genuine"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-zinc-700">Author</span>
            <Input
              className="mt-1"
              value={draft.authorName}
              onChange={(e) => setDraft((d) => ({ ...d, authorName: e.target.value }))}
              placeholder="Karen"
              required
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Review text</span>
          <Textarea
            className="mt-1 min-h-28"
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            required
          />
        </label>
        <Button type="submit" disabled={creating}>
          {creating ? "Adding…" : "Add to library"}
        </Button>
      </form>

      <ul className="space-y-4">
        {reviews.length === 0 ? (
          <li className="rounded-lg border border-dashed border-zinc-300 bg-white px-5 py-10 text-center text-sm text-zinc-500">
            No reviews yet. Add one above or seed the database.
          </li>
        ) : (
          reviews.map((review) => (
            <li
              key={review.id}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">{review.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">-- {review.author_name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busyId === review.id}
                    onClick={() => onDelete(review.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-600">{review.body}</p>

              <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-zinc-100 pt-4">
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={review.is_visible}
                    disabled={busyId === review.id}
                    onChange={(e) => void patchReview(review.id, { isVisible: e.target.checked })}
                  />
                  In library (visible)
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    checked={review.is_featured}
                    disabled={busyId === review.id || !review.is_visible}
                    onChange={(e) => void patchReview(review.id, { isFeatured: e.target.checked })}
                  />
                  Show on About page
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-700">
                  <span>Order</span>
                  <Input
                    type="number"
                    min={0}
                    max={99}
                    className="h-8 w-16"
                    defaultValue={review.display_order}
                    disabled={busyId === review.id || !review.is_featured}
                    onBlur={(e) => {
                      const displayOrder = Number.parseInt(e.target.value, 10);
                      if (!Number.isNaN(displayOrder) && displayOrder !== review.display_order) {
                        void patchReview(review.id, { displayOrder });
                      }
                    }}
                  />
                </label>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
