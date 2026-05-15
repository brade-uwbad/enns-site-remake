import { z } from "zod";


// Old schema

// /** Public contact form payload for `POST /api/contact`. */
// export const contactFormSchema = z.object({
//   name: z.string().min(1).max(200),
//   email: z.string().email().max(320),
//   phone: z.string().max(40).optional().nullable(),
//   message: z.string().min(1).max(10000),
// });

/** Valuation request payload for `POST /api/contact/valuation`; adds optional property `address`. */
export const valuationFormSchema = contactFormSchema.extend({
  address: z.string().max(300).optional().nullable(),
});


/**
 * Schema for the `/contact` page form. Added a `honeypot` field
 * for spam protection. Logic is honeypot field should be invisible to humans 
 * and be left empty. However, bots parsing html will fill it out unintentionally.
 */
export const contactPageFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email").max(320),
  phone: z.string().max(40).optional().nullable(),
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required")
    .max(150, "Subject must be 150 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(10000, "Message must be 10,000 characters or fewer"),
  honeypot: z.string().max(0).optional(),
});

/** Inferred TypeScript type for the contact page form values. */
export type ContactPageFormValues = z.infer<typeof contactPageFormSchema>;
