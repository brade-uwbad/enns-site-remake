import { jsonError, jsonOk } from "@/lib/api/http";
import { recoverSchema } from "@/lib/validations/auth";

/**
 * `POST /api/auth/recover` — Validates email; password reset emails not wired yet (placeholder).
 *
 * @param request - JSON `{ email, redirectTo? }` per {@link recoverSchema}.
 * @returns JSON `{ data: { message, email } }`.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = recoverSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  return jsonOk({
    message:
      "Password recovery is not wired to email delivery yet. Connect Supabase Auth to enable reset emails.",
    email: parsed.data.email,
  });
}
