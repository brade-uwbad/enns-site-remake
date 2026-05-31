import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { upsertSiteContent } from "@/lib/content/admin";
import { isSiteContentKey } from "@/lib/content/keys";
import { fetchSiteContent } from "@/lib/content/query";
import { siteContentSchemas } from "@/lib/validations/site-content";

type Params = { params: Promise<{ key: string }> };

/**
 * `GET /api/admin/content/[key]` — Load editable page copy for admin forms.
 */
export async function GET(request: Request, ctx: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  const { key } = await ctx.params;
  if (!isSiteContentKey(key)) {
    return jsonError("Unknown content page", 404, "NOT_FOUND");
  }

  try {
    const row = await fetchSiteContent(key);
    return jsonOk({ content: row.payload, updatedAt: row.updatedAt });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load content";
    return jsonError(message, 500, "CONTENT_ERROR");
  }
}

/**
 * `PUT /api/admin/content/[key]` — Save page copy (admin bearer token required).
 */
export async function PUT(request: Request, ctx: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  const { key } = await ctx.params;
  if (!isSiteContentKey(key)) {
    return jsonError("Unknown content page", 404, "NOT_FOUND");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const schema = siteContentSchemas[key];
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  try {
    const row = await upsertSiteContent(key, parsed.data);
    return jsonOk({ content: row.payload, updatedAt: row.updatedAt });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save content";
    return jsonError(message, 500, "CONTENT_ERROR");
  }
}
