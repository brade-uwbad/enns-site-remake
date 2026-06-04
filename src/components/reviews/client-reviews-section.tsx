"use client";

import { useEffect, useState } from "react";

import { ABOUT_FEATURED_REVIEW_LIMIT } from "@/lib/reviews/constants";
import type { ReviewRow } from "@/lib/store/types";

type ClientReviewsSectionProps = {
  reviews: ReviewRow[];
};

export function ClientReviewsSection({ reviews }: ClientReviewsSectionProps) {
  const displayed = reviews.slice(0, ABOUT_FEATURED_REVIEW_LIMIT);
  const [activeReview, setActiveReview] = useState<ReviewRow | null>(null);

  useEffect(() => {
    if (!activeReview) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveReview(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeReview]);

  if (displayed.length === 0) {
    return null;
  }

  return (
    <>
      <section className="bg-white pb-12 pt-0 md:pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Client Reviews</h2>

          <ul className="mt-5 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {displayed.map((review) => (
              <li key={review.id}>
                <button
                  type="button"
                  onClick={() => setActiveReview(review)}
                  className="flex h-[220px] w-full flex-col rounded-lg border border-slate-300 bg-white px-5 py-4 text-left shadow-sm transition hover:border-slate-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A6696] focus-visible:ring-offset-2"
                  aria-haspopup="dialog"
                >
                  <h3 className="shrink-0 text-base font-bold text-slate-900">{review.title}</h3>
                  <p className="mt-2 line-clamp-5 text-sm leading-relaxed break-words text-slate-600">
                    {review.body}
                  </p>
                  <p className="mt-auto shrink-0 pt-3 text-sm text-slate-500">-- {review.author_name}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {activeReview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setActiveReview(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`review-dialog-title-${activeReview.id}`}
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveReview(null)}
              className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700"
              aria-label="Close review"
            >
              ✕
            </button>
            <h3
              id={`review-dialog-title-${activeReview.id}`}
              className="pr-8 text-lg font-bold text-slate-900"
            >
              {activeReview.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{activeReview.body}</p>
            <p className="mt-6 text-sm text-slate-500">-- {activeReview.author_name}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
