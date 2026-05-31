import { jsonError, jsonOk } from "@/lib/api/http";
import { isSiteContentKey } from "@/lib/content/keys";
import { fetchSiteContent } from "@/lib/content/query";

type Params = { params: Promise<{ key: string }> };

/**
 * `GET /api/content/[key]` — Public JSON for a marketing page content blob.
 */
export async function GET(_request: Request, ctx: Params) {
  const { key } = await ctx.params;
  if (!isSiteContentKey(key)) {
    return jsonError("Content not found", 404, "NOT_FOUND");
  }

  try {
    const row = await fetchSiteContent(key);
    return jsonOk({ content: row.payload, updatedAt: row.updatedAt });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load content";
    return jsonError(message, 500, "CONTENT_ERROR");
  }
}
