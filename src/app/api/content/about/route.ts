import { jsonError, jsonOk } from "@/lib/api/http";
import { getSiteContent } from "@/lib/store/memory";

/**
 * `GET /api/content/about` — JSON payload for the About page.
 *
 * @returns JSON `{ data: { content, updatedAt } }`, or 404 if missing.
 */
export async function GET() {
  const row = getSiteContent("about");
  if (!row) {
    return jsonError("About content not found", 404, "NOT_FOUND");
  }

  return jsonOk({ content: row.payload, updatedAt: row.updated_at });
}
