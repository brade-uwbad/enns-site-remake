import type { ReviewRow } from "@/lib/store/types";

type ClientReviewsSectionProps = {
  reviews: ReviewRow[];
};

export function ClientReviewsSection({ reviews }: ClientReviewsSectionProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-slate-200 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Client Reviews</h2>

        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-bold text-slate-900">{review.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">{review.body}</p>
              <p className="mt-6 text-sm text-slate-500">-- {review.author_name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
