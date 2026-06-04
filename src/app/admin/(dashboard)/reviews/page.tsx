import type { Metadata } from "next";

import { ReviewsManager } from "@/components/admin/reviews-manager";
import { AdminChrome } from "@/components/admin/admin-ui";
import { fetchAllReviewsAdmin } from "@/lib/reviews/admin";

export const metadata: Metadata = {
  title: "Client reviews",
  description: "Curate testimonials shown on the About page.",
};

export default async function AdminReviewsPage() {
  const reviews = await fetchAllReviewsAdmin();

  return (
    <AdminChrome maxWidth="3xl">
      <ReviewsManager initialReviews={reviews} />
    </AdminChrome>
  );
}
