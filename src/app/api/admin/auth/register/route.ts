import { jsonError, jsonOk } from "@/lib/api/http";
import { buildAdminUserMetadata } from "@/lib/auth/admin-user-metadata";
import { formatAuthError } from "@/lib/auth/format-auth-error";
import { checkPassword } from "@/lib/auth/password";
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { adminRegisterSchema } from "@/lib/validations/admin-auth";

/**
 * Creates a confirmed admin user via the service role (no manual role assignment in Supabase).
 */
export async function POST(request: Request) {
  if (!hasSupabaseAdminConfig()) {
    return jsonError(
      "Admin registration is not configured on the server. Add STORAGE_SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY to your environment.",
      503,
      "CONFIG_ERROR",
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = adminRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  const passwordChecks = checkPassword(parsed.data.password);
  if (!passwordChecks.valid) {
    return jsonError("Password does not meet the requirements.", 400, "VALIDATION_ERROR");
  }

  const { app_metadata, user_metadata } = buildAdminUserMetadata(
    parsed.data.firstName,
    parsed.data.lastName,
  );

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata,
    user_metadata,
  });

  if (error) {
    const message = formatAuthError(error.message);
    const status = error.message.toLowerCase().includes("already") ? 409 : 400;
    return jsonError(message, status, "AUTH_ERROR");
  }

  return jsonOk({
    message: "Account created. You can sign in now.",
    email: parsed.data.email,
  });
}
