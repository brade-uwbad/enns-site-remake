import { jsonOk } from "@/lib/api/http";
import { hasSupabaseAdminConfig, hasSupabaseReadConfig } from "@/lib/supabase/server";

/**
 * `GET /api/health` — Liveness check for the API and a hint about in-memory / admin auth mode.
 *
 * @returns JSON `{ data: { status, dataStore, adminAuth } }` with HTTP 200.
 */
export async function GET() {
  return jsonOk({
    status: "ok",
    dataStore: hasSupabaseReadConfig() ? "supabase" : "memory",
    adminAuth: hasSupabaseAdminConfig() ? "supabase-access-token+admin-role" : "not-configured",
  });
}
