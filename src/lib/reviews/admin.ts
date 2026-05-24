import { ABOUT_FEATURED_REVIEW_LIMIT } from "@/lib/reviews/constants";
import { normalizeReview } from "@/lib/reviews/normalize";
import type { ReviewRow } from "@/lib/store/types";
import {
  countFeaturedReviews,
  deleteReviewById as deleteReviewMemory,
  insertReview as insertReviewMemory,
  listAllReviews,
  updateReviewById as updateReviewMemory,
} from "@/lib/store/memory";
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export type ReviewUpsertInput = {
  title: string;
  authorName: string;
  body: string;
  rating?: number | null;
  isVisible?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
};

function toDbRow(input: ReviewUpsertInput) {
  return {
    title: input.title.trim(),
    author_name: input.authorName.trim(),
    body: input.body.trim(),
    rating: input.rating ?? null,
    is_visible: input.isVisible ?? true,
    is_featured: input.isFeatured ?? false,
    display_order: input.displayOrder ?? 0,
  };
}

export async function fetchAllReviewsAdmin(): Promise<ReviewRow[]> {
  if (!hasSupabaseAdminConfig()) {
    return listAllReviews();
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id,title,author_name,body,rating,is_visible,is_featured,display_order,created_at")
    .order("is_featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => normalizeReview(row));
}

export async function countFeaturedReviewsAdmin(excludeId?: string): Promise<number> {
  if (!hasSupabaseAdminConfig()) {
    return countFeaturedReviews(excludeId);
  }

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("is_featured", true)
    .eq("is_visible", true);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function createReviewAdmin(input: ReviewUpsertInput): Promise<ReviewRow> {
  if (input.isFeatured) {
    const featuredCount = await countFeaturedReviewsAdmin();
    if (featuredCount >= ABOUT_FEATURED_REVIEW_LIMIT) {
      throw new Error(
        `Only ${ABOUT_FEATURED_REVIEW_LIMIT} reviews can be featured on the About page. Unfeature another review first.`,
      );
    }
  }

  const row = toDbRow(input);

  if (!hasSupabaseAdminConfig()) {
    return insertReviewMemory(row);
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("reviews").insert(row).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeReview(data);
}

export async function updateReviewAdmin(id: string, input: Partial<ReviewUpsertInput>): Promise<ReviewRow> {
  if (input.isFeatured) {
    const featuredCount = await countFeaturedReviewsAdmin(id);
    if (featuredCount >= ABOUT_FEATURED_REVIEW_LIMIT) {
      throw new Error(
        `Only ${ABOUT_FEATURED_REVIEW_LIMIT} reviews can be featured on the About page. Unfeature another review first.`,
      );
    }
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.authorName !== undefined) patch.author_name = input.authorName.trim();
  if (input.body !== undefined) patch.body = input.body.trim();
  if (input.rating !== undefined) patch.rating = input.rating;
  if (input.isVisible !== undefined) patch.is_visible = input.isVisible;
  if (input.isFeatured !== undefined) patch.is_featured = input.isFeatured;
  if (input.displayOrder !== undefined) patch.display_order = input.displayOrder;

  if (input.isVisible === false) {
    patch.is_featured = false;
  }

  if (!hasSupabaseAdminConfig()) {
    const updated = updateReviewMemory(id, patch);
    if (!updated) {
      throw new Error("Review not found");
    }
    return updated;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("reviews").update(patch).eq("id", id).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeReview(data);
}

export async function deleteReviewAdmin(id: string): Promise<void> {
  if (!hasSupabaseAdminConfig()) {
    const ok = deleteReviewMemory(id);
    if (!ok) {
      throw new Error("Review not found");
    }
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
