import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

/** Admin identity returned when Supabase-backed admin auth succeeds. */
export type AdminUser = { id: string; email: string };

/**
 * Result of checking whether an incoming request may access admin-only APIs.
 *
 * @remarks
 * When `ok` is true, `user` is populated. When false, use `status` and `message` for the HTTP response.
 */
export type AdminAuthResult =
  | { ok: true; user: AdminUser }
  | { ok: false; status: number; message: string };

/**
 * Extracts a bearer token from the `Authorization` header.
 *
 * @param request - Incoming HTTP request.
 * @returns The token string after `Bearer `, or `null` if missing or malformed.
 */
function bearerToken(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return h.slice(7).trim() || null;
}

function isAdminRole(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}) {
  const appRole = user.app_metadata?.role;
  if (typeof appRole === "string" && appRole.toLowerCase() === "admin") {
    return true;
  }

  const userRole = user.user_metadata?.role;
  if (typeof userRole === "string" && userRole.toLowerCase() === "admin") {
    return true;
  }

  const appRoles = user.app_metadata?.roles;
  if (
    Array.isArray(appRoles) &&
    appRoles.some((r) => typeof r === "string" && r.toLowerCase() === "admin")
  ) {
    return true;
  }

  return false;
}

/**
 * Verifies that the request is allowed to call admin-only Route Handlers.
 *
 * @param request - Must include `Authorization: Bearer <supabase_access_token>`.
 *   The token is validated with Supabase Auth, then `admin` role is required in metadata.
 * @returns A discriminated result: authenticated admin user, or HTTP status and message to return.
 *
 * @remarks
 * Admin role is recognized from one of:
 * - `app_metadata.role = "admin"`
 * - `user_metadata.role = "admin"`
 * - `app_metadata.roles` containing `"admin"`
 */
export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  // Local/staging bypass for admin UI. Do not enable in production unless intentionally public.
  if (process.env.ADMIN_UI_BYPASS_AUTH === "true") {
    return {
      ok: true,
      user: { id: "00000000-0000-0000-0000-000000000001", email: "admin@local" },
    };
  }

  // Simpler non-JWT mode if a static admin token is configured.
  const staticAdminToken = process.env.ADMIN_API_TOKEN;
  if (staticAdminToken) {
    const token = bearerToken(request);
    if (!token) {
      return { ok: false, status: 401, message: "Missing Bearer token" };
    }
    if (token !== staticAdminToken) {
      return { ok: false, status: 401, message: "Invalid admin token" };
    }
    return { ok: true, user: { id: "static-admin", email: "admin@local" } };
  }

  if (!hasSupabaseAdminConfig()) {
    return { ok: false, status: 500, message: "Supabase admin config is missing on the server" };
  }

  const token = bearerToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Missing Bearer token" };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, message: "Invalid Supabase access token" };
  }

  if (!isAdminRole(data.user)) {
    return { ok: false, status: 403, message: "Admin role required" };
  }

  return {
    ok: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? "unknown@supabase.local",
    },
  };
}
