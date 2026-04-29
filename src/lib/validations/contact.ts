import { z } from "zod";

/** Public contact form payload for `POST /api/contact`. */
export const contactFormSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(40).optional().nullable(),
  message: z.string().min(1).max(10000),
});

/** Valuation request payload for `POST /api/contact/valuation`; adds optional property `address`. */
export const valuationFormSchema = contactFormSchema.extend({
  address: z.string().max(300).optional().nullable(),
});
