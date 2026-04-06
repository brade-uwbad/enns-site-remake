import { jsonError, jsonOk } from "@/lib/api/http";
import { loginSchema } from "@/lib/validations/auth";

/**
 * `POST /api/auth/login` — Validates body shape; auth provider not connected (placeholder response).
 *
 * @param request - JSON `{ email, password }` per {@link loginSchema}.
 * @returns JSON `{ data: { message, email } }` explaining next steps for real auth.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  return jsonOk({
    message:
      "Auth is not wired to a provider yet. Use admin APIs with Authorization: Bearer until Supabase Auth is connected.",
    email: parsed.data.email,
  });
}
