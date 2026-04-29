import { jsonError, jsonOk } from "@/lib/api/http";
import { registerSchema } from "@/lib/validations/auth";

/**
 * `POST /api/auth/register` — Validates body shape; registration not persisted yet (placeholder).
 *
 * @param request - JSON `{ email, password }` per {@link registerSchema}.
 * @returns JSON `{ data: { message, email } }`.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  return jsonOk({
    message:
      "Registration is not wired to a provider yet. Connect Supabase Auth when you are ready to persist accounts.",
    email: parsed.data.email,
  });
}
