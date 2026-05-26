import { z } from "zod";

/** Body for `POST /api/admin/auth/register` (admin sign-up page only). */
export const adminRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
});
