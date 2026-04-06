import { jsonOk } from "@/lib/api/http";

/**
 * `GET /api/health` — Liveness check for the API and a hint about in-memory / admin auth mode.
 *
 * @returns JSON `{ data: { status, dataStore, adminAuth } }` with HTTP 200.
 */
export async function GET() {
  return jsonOk({
    status: "ok",
    dataStore: "memory",
    adminAuth: process.env.ADMIN_API_TOKEN ? "token" : "any-bearer",
  });
}
