import { z } from "zod";

import { ABOUT_DISPLAY_ORDER_MAX, ABOUT_DISPLAY_ORDER_MIN } from "@/lib/reviews/constants";

const reviewFieldsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  authorName: z.string().trim().min(1, "Author name is required").max(200),
  body: z.string().trim().min(1, "Review text is required").max(10000),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  isVisible: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z
    .number()
    .int()
    .min(ABOUT_DISPLAY_ORDER_MIN)
    .max(ABOUT_DISPLAY_ORDER_MAX)
    .optional(),
});

/** Admin body for `POST /api/admin/reviews`. */
export const reviewCreateSchema = reviewFieldsSchema;

/** Admin body for `PATCH /api/admin/reviews/[id]`. */
export const reviewUpdateSchema = reviewFieldsSchema.partial();

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
