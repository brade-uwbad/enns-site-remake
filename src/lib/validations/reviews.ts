import { z } from "zod";

/** Admin body for `POST /api/admin/reviews`. */
export const reviewCreateSchema = z.object({
  authorName: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  isVisible: z.boolean().optional(),
});

/** Inferred type from {@link reviewCreateSchema}. */
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
