import { ABOUT_DISPLAY_ORDER_MIN } from "@/lib/reviews/constants";
import type { ReviewRow } from "@/lib/store/types";

/** A review is "shown" on the About page only when featured AND visible. */
function isShown(review: ReviewRow): boolean {
  return review.is_featured && review.is_visible;
}

/**
 * Stable order of the shown reviews: by position, then newest first — matching
 * how the About page and admin list fetch them.
 */
function byShownOrder(a: ReviewRow, b: ReviewRow): number {
  if (a.display_order !== b.display_order) {
    return a.display_order - b.display_order;
  }
  return a.created_at < b.created_at ? 1 : -1;
}

type PlanInput = {
  /** The review's featured state after this change. */
  nextIsFeatured: boolean;
  /** The review's visible state after this change. */
  nextIsVisible: boolean;
  /** Requested position (1-based) when repositioning an already-shown review. */
  requestedOrder?: number;
};

/**
 * Computes the `display_order` values needed to keep the About-page reviews in a
 * clean, contiguous `1..N` sequence after a curation change to one review.
 *
 * Behaviour:
 * - Featuring a review appends it to the end of the row.
 * - Un-featuring/hiding a review removes it and compacts the rest down so there
 *   are no gaps (e.g. removing position 2 of `[1,2,3]` shifts `3 -> 2`).
 * - Repositioning a shown review to an occupied slot swaps the two reviews
 *   (e.g. moving position 3 to 1 sends the review at 1 down to 3).
 *
 * Only the reviews whose position actually changes are returned.
 */
export function planReviewOrder(
  all: ReviewRow[],
  currentId: string,
  { nextIsFeatured, nextIsVisible, requestedOrder }: PlanInput,
): { id: string; displayOrder: number }[] {
  const current = all.find((review) => review.id === currentId);
  if (!current) {
    return [];
  }

  const others = all
    .filter((review) => review.id !== currentId && isShown(review))
    .sort(byShownOrder);
  const wasShown = isShown(current);
  const willBeShown = nextIsFeatured && nextIsVisible;

  let finalOrder: ReviewRow[];

  if (!willBeShown) {
    // Removed from the row — the remaining shown reviews compact to fill the gap.
    finalOrder = others;
  } else if (!wasShown) {
    // Newly shown — append to the end of the row.
    finalOrder = [...others, current];
  } else if (requestedOrder !== undefined && requestedOrder !== current.display_order) {
    // Repositioning an existing review — swap with whoever holds the target slot.
    const withCurrent = [...others, current].sort(byShownOrder);
    const total = withCurrent.length;
    const target = Math.min(Math.max(requestedOrder, ABOUT_DISPLAY_ORDER_MIN), total);
    const fromIndex = withCurrent.findIndex((review) => review.id === currentId);
    const toIndex = target - 1;
    finalOrder = [...withCurrent];
    [finalOrder[fromIndex], finalOrder[toIndex]] = [finalOrder[toIndex], finalOrder[fromIndex]];
  } else {
    // No positional change (e.g. only text edits) — keep the existing order,
    // which also self-heals any pre-existing gaps.
    finalOrder = [...others, current].sort(byShownOrder);
  }

  const assignments: { id: string; displayOrder: number }[] = [];
  finalOrder.forEach((review, index) => {
    const displayOrder = ABOUT_DISPLAY_ORDER_MIN + index;
    const existingOrder = review.id === currentId ? current.display_order : review.display_order;
    if (displayOrder !== existingOrder) {
      assignments.push({ id: review.id, displayOrder });
    }
  });

  return assignments;
}
