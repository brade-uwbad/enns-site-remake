import type { Metadata } from "next";

import { ReviewsManager } from "@/components/admin/reviews-manager";
import { fetchAllReviewsAdmin } from "@/lib/reviews/admin";

export const metadata: Metadata = {
  title: "Client reviews",
  description: "Curate testimonials shown on the About page.",
};

export default async function AdminReviewsPage() {
  const reviews = await fetchAllReviewsAdmin();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <ReviewsManager initialReviews={reviews} />
      </div>
    </div>
  );
}
