import { jsonOk } from "@/lib/api/http";
import { fetchSiteContent } from "@/lib/content/query";

/** `GET /api/content/homepage` — JSON payload for homepage CMS-style content. */
export async function GET() {
  const row = await fetchSiteContent("homepage");
  return jsonOk({ content: row.payload, updatedAt: row.updatedAt });
}
