import { ABOUT_FEATURED_REVIEW_LIMIT } from "@/lib/reviews/constants";
import { normalizeReview } from "@/lib/reviews/normalize";
import { listFeaturedReviews, listReviews } from "@/lib/store/memory";
import { getSupabaseReadClient, hasSupabaseReadConfig } from "@/lib/supabase/server";

/**
 * Testimonials curated for the About page (featured, visible, ordered).
 */
export async function fetchFeaturedReviews(limit = ABOUT_FEATURED_REVIEW_LIMIT) {
  if (!hasSupabaseReadConfig()) {
    return listFeaturedReviews(limit);
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id,title,author_name,body,rating,is_visible,is_featured,display_order,created_at")
    .eq("is_visible", true)
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return listFeaturedReviews(limit);
  }

  return (data ?? []).map((row) => normalizeReview(row)).slice(0, limit);
}

/**
 * All visible reviews (newest first) for optional future placements.
 */
export async function fetchVisibleReviews() {
  if (!hasSupabaseReadConfig()) {
    return listReviews().filter((r) => r.is_visible);
  }

  const supabase = getSupabaseReadClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id,title,author_name,body,rating,is_visible,is_featured,display_order,created_at")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    return listReviews().filter((r) => r.is_visible);
  }

  return (data ?? []).map((row) => normalizeReview(row));
}
