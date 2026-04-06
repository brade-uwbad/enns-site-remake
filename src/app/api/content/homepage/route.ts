import { jsonError, jsonOk } from "@/lib/api/http";
import { getSiteContent } from "@/lib/store/memory";

/**
 * `GET /api/content/homepage` — JSON payload for homepage CMS-style content.
 *
 * @returns JSON `{ data: { content, updatedAt } }`, or 404 if missing.
 */
export async function GET() {
  const row = getSiteContent("homepage");
  if (!row) {
    return jsonError("Homepage content not found", 404, "NOT_FOUND");
  }

  return jsonOk({ content: row.payload, updatedAt: row.updated_at });
}
