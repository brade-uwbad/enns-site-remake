import { z } from "zod";

/** Credentials body for `POST /api/auth/login` (placeholder until Supabase Auth). */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/** Registration body for `POST /api/auth/register`. */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/** Password recovery request for `POST /api/auth/recover`; optional `redirectTo` for email links. */
export const recoverSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().url().optional(),
});
