import {
  ABOUT_DISPLAY_ORDER_MAX,
  ABOUT_DISPLAY_ORDER_MIN,
  ABOUT_FEATURED_REVIEW_LIMIT,
} from "@/lib/reviews/constants";
import { normalizeReview } from "@/lib/reviews/normalize";
import { planReviewOrder } from "@/lib/reviews/reorder";
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

function toDbRow(input: ReviewUpsertInput & { displayOrder: number }) {
  return {
    title: input.title.trim(),
    author_name: input.authorName.trim(),
    body: input.body.trim(),
    rating: input.rating ?? null,
    is_visible: input.isVisible ?? true,
    is_featured: input.isFeatured ?? false,
    display_order: input.displayOrder,
  };
}

/** Place new/featured reviews at the end of the About row (after existing featured). */
async function findEndDisplayOrder(excludeId?: string): Promise<number> {
  const featuredCount = await countFeaturedReviewsAdmin(excludeId);
  return Math.min(ABOUT_DISPLAY_ORDER_MIN + featuredCount, ABOUT_DISPLAY_ORDER_MAX);
}

async function assertDisplayOrderAvailable(order: number, excludeId?: string) {
  const all = await fetchAllReviewsAdmin();
  const conflict = all.find(
    (r) =>
      (!excludeId || r.id !== excludeId) && r.is_featured && r.is_visible && r.display_order === order,
  );

  if (conflict) {
    throw new Error(
      `Position ${order} is already used by "${conflict.title}". Pick 1, 2, or 3 for a different review first.`,
    );
  }
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

  const isFeatured = input.isFeatured ?? false;
  const displayOrder = isFeatured
    ? (input.displayOrder ?? (await findEndDisplayOrder()))
    : ABOUT_DISPLAY_ORDER_MIN;

  if (isFeatured && input.displayOrder !== undefined) {
    await assertDisplayOrderAvailable(displayOrder);
  }

  const row = toDbRow({ ...input, isFeatured, displayOrder });

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
  const all = await fetchAllReviewsAdmin();
  const current = all.find((review) => review.id === id);
  if (!current) {
    throw new Error("Review not found");
  }

  // Resolve the review's next curation state. Hiding a review also unfeatures it.
  const nextIsVisible = input.isVisible ?? current.is_visible;
  let nextIsFeatured = input.isFeatured ?? current.is_featured;
  if (!nextIsVisible) {
    nextIsFeatured = false;
  }

  const wasShown = current.is_featured && current.is_visible;
  const willBeShown = nextIsFeatured && nextIsVisible;

  // Enforce the About-page limit only when this review is newly joining the row.
  if (willBeShown && !wasShown) {
    const shownOthers = all.filter(
      (review) => review.id !== id && review.is_featured && review.is_visible,
    ).length;
    if (shownOthers >= ABOUT_FEATURED_REVIEW_LIMIT) {
      throw new Error(
        `Only ${ABOUT_FEATURED_REVIEW_LIMIT} reviews can be featured on the About page. Unfeature another review first.`,
      );
    }
  }

  // Field edits that don't affect ordering.
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) {
    patch.title = input.title.trim();
  }
  if (input.authorName !== undefined) {
    patch.author_name = input.authorName.trim();
  }
  if (input.body !== undefined) {
    patch.body = input.body.trim();
  }
  if (input.rating !== undefined) {
    patch.rating = input.rating;
  }
  if (input.isVisible !== undefined) {
    patch.is_visible = nextIsVisible;
  }
  if (nextIsFeatured !== current.is_featured) {
    patch.is_featured = nextIsFeatured;
  }

  // Work out the position changes (swap / compaction / append) for this review
  // and any siblings it displaces, keeping the row contiguous as 1..N.
  const assignments = planReviewOrder(all, id, {
    nextIsFeatured,
    nextIsVisible,
    requestedOrder: input.displayOrder,
  });
  const siblingUpdates = assignments.filter((assignment) => assignment.id !== id);
  const ownOrder = assignments.find((assignment) => assignment.id === id);
  if (ownOrder) {
    patch.display_order = ownOrder.displayOrder;
  }

  if (!hasSupabaseAdminConfig()) {
    for (const sibling of siblingUpdates) {
      updateReviewMemory(sibling.id, { display_order: sibling.displayOrder });
    }
    const updated = updateReviewMemory(id, patch);
    if (!updated) {
      throw new Error("Review not found");
    }
    return updated;
  }

  const supabase = getSupabaseAdminClient();
  for (const sibling of siblingUpdates) {
    const { error } = await supabase
      .from("reviews")
      .update({ display_order: sibling.displayOrder })
      .eq("id", sibling.id);
    if (error) {
      throw new Error(error.message);
    }
  }

  if (Object.keys(patch).length === 0) {
    return current;
  }

  const { data, error } = await supabase.from("reviews").update(patch).eq("id", id).select().single();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeReview(data);
}

export async function deleteReviewAdmin(id: string): Promise<void> {
  // Removing a featured review would leave a gap in the About row, so compact
  // the remaining reviews down before deleting.
  const all = await fetchAllReviewsAdmin();
  const target = all.find((review) => review.id === id);
  const siblingUpdates = target
    ? planReviewOrder(all, id, { nextIsFeatured: false, nextIsVisible: false })
    : [];

  if (!hasSupabaseAdminConfig()) {
    const ok = deleteReviewMemory(id);
    if (!ok) {
      throw new Error("Review not found");
    }
    for (const sibling of siblingUpdates) {
      updateReviewMemory(sibling.id, { display_order: sibling.displayOrder });
    }
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  for (const sibling of siblingUpdates) {
    const { error: reorderError } = await supabase
      .from("reviews")
      .update({ display_order: sibling.displayOrder })
      .eq("id", sibling.id);
    if (reorderError) {
      throw new Error(reorderError.message);
    }
  }
}
