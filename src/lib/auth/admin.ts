/** Synthetic admin identity returned when admin API auth succeeds (in-memory / token-based MVP). */
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
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  return h.slice(7).trim() || null;
}

const DEFAULT_DEV_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Verifies that the request is allowed to call admin-only Route Handlers.
 *
 * @param request - Must include `Authorization: Bearer <token>`. If `ADMIN_API_TOKEN` is set,
 *   the token must match; otherwise any non-empty bearer token is accepted (local MVP).
 * @returns A discriminated result: authenticated admin user, or HTTP status and message to return.
 *
 * @remarks
 * This is a placeholder until Supabase Auth (or similar) issues real sessions and roles.
 */
export async function requireAdmin(request: Request): Promise<AdminAuthResult> {
  const token = bearerToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Missing Bearer token" };
  }

  const expected = process.env.ADMIN_API_TOKEN;
  if (expected && token !== expected) {
    return { ok: false, status: 401, message: "Invalid admin token" };
  }

  return { ok: true, user: { id: DEFAULT_DEV_ID, email: "admin@local" } };
}
