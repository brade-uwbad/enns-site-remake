import { jsonOk } from "@/lib/api/http";
import { fetchSiteContent } from "@/lib/content/query";

/** `GET /api/content/about` — JSON payload for the About page. */
export async function GET() {
  const row = await fetchSiteContent("about");
  return jsonOk({ content: row.payload, updatedAt: row.updatedAt });
}
