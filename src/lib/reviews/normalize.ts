import type { ReviewRow } from "@/lib/store/types";

type ReviewDbRow = {
  id: string;
  title?: string | null;
  author_name: string;
  body: string;
  rating?: number | null;
  is_visible: boolean;
  is_featured?: boolean | null;
  display_order?: number | null;
  created_at: string;
};

export function normalizeReview(row: ReviewDbRow): ReviewRow {
  return {
    id: row.id,
    title: row.title?.trim() || "",
    author_name: row.author_name,
    body: row.body,
    rating: row.rating ?? null,
    is_visible: row.is_visible,
    is_featured: row.is_featured ?? false,
    display_order: row.display_order ?? 0,
    created_at: row.created_at,
  };
}
