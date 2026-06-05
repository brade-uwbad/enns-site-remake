"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  adminCardClass,
  adminInputClass,
  adminLinkClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
  AdminPageHeader,
} from "@/components/admin/admin-ui";
import { useAdminUser } from "@/hooks/use-admin-user";
import {
  ABOUT_DISPLAY_ORDER_MAX,
  ABOUT_DISPLAY_ORDER_MIN,
  ABOUT_FEATURED_REVIEW_LIMIT,
} from "@/lib/reviews/constants";
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
      <AdminPageHeader
        breadcrumb={
          <Link href="/admin/dashboard" className={adminLinkClass}>
            ← Back to dashboard
          </Link>
        }
        title="Client reviews"
        description={`Build a library of testimonials. Choose up to ${ABOUT_FEATURED_REVIEW_LIMIT} to feature on the About page (${featuredCount}/${ABOUT_FEATURED_REVIEW_LIMIT} selected). Use position ${ABOUT_DISPLAY_ORDER_MIN}–${ABOUT_DISPLAY_ORDER_MAX} for left-to-right placement (1 = left).`}
      />
      <p className="-mt-4 text-sm text-slate-600">
        Public preview:{" "}
        <Link href="/about" className={adminLinkClass} target="_blank">
          /about
        </Link>
      </p>

      {message ? (
        <p className="rounded-sm border border-slate-300 bg-[#eef4fa] px-4 py-3 text-sm text-[#140000]">
          {message}
        </p>
      ) : null}

      <form onSubmit={onCreate} className={`space-y-4 p-5 sm:p-6 ${adminCardClass}`}>
        <h2 className="text-lg font-semibold text-[#140000]">Add review</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-[#140000]">Headline</span>
            <input
              className={`mt-1 ${adminInputClass}`}
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Honest and Genuine"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-[#140000]">Author</span>
            <input
              className={`mt-1 ${adminInputClass}`}
              value={draft.authorName}
              onChange={(e) => setDraft((d) => ({ ...d, authorName: e.target.value }))}
              placeholder="Karen"
              required
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-[#140000]">Review text</span>
          <textarea
            className={`mt-1 ${adminTextareaClass}`}
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            required
          />
        </label>
        <button type="submit" disabled={creating} className={adminPrimaryButtonClass}>
          {creating ? "Adding…" : "Add to library"}
        </button>
      </form>

      <ul className="space-y-4">
        {reviews.length === 0 ? (
          <li
            className={`px-5 py-10 text-center text-sm text-slate-600 ${adminCardClass} border-dashed`}
          >
            No reviews yet. Add one above or seed the database.
          </li>
        ) : (
          reviews.map((review) => (
            <li key={review.id} className={`p-5 sm:p-6 ${adminCardClass}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#140000]">{review.title}</p>
                  <p className="mt-1 text-sm text-slate-600">-- {review.author_name}</p>
                </div>
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => void onDelete(review.id)}
                  className="rounded-sm border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{review.body}</p>

              <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <label className="flex items-center gap-2 text-sm text-[#140000]">
                  <input
                    type="checkbox"
                    checked={review.is_visible}
                    disabled={busyId === review.id}
                    onChange={(e) => void patchReview(review.id, { isVisible: e.target.checked })}
                  />
                  In library (visible)
                </label>
                <label className="flex items-center gap-2 text-sm text-[#140000]">
                  <input
                    type="checkbox"
                    checked={review.is_featured}
                    disabled={
                      busyId === review.id ||
                      !review.is_visible ||
                      (featuredCount >= ABOUT_FEATURED_REVIEW_LIMIT && !review.is_featured)
                    }
                    onChange={(e) => void patchReview(review.id, { isFeatured: e.target.checked })}
                  />
                  Show on About page
                  {featuredCount >= ABOUT_FEATURED_REVIEW_LIMIT && !review.is_featured ? (
                    <span className="text-xs text-slate-500">(max {ABOUT_FEATURED_REVIEW_LIMIT})</span>
                  ) : null}
                </label>
                {review.is_featured ? (
                  <label className="flex items-center gap-2 text-sm text-[#140000]">
                    <span>Position</span>
                    <select
                      className="h-9 rounded-sm border border-zinc-300 bg-white px-2 text-sm text-[#140000]"
                      value={Math.min(
                        ABOUT_DISPLAY_ORDER_MAX,
                        Math.max(ABOUT_DISPLAY_ORDER_MIN, review.display_order),
                      )}
                      disabled={busyId === review.id}
                      onChange={(e) => {
                        const displayOrder = Number.parseInt(e.target.value, 10);
                        if (!Number.isNaN(displayOrder) && displayOrder !== review.display_order) {
                          void patchReview(review.id, { displayOrder });
                        }
                      }}
                    >
                      {Array.from(
                        { length: ABOUT_DISPLAY_ORDER_MAX - ABOUT_DISPLAY_ORDER_MIN + 1 },
                        (_, i) => ABOUT_DISPLAY_ORDER_MIN + i,
                      ).map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
