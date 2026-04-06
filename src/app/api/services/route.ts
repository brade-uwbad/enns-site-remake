import { jsonOk } from "@/lib/api/http";
import { listServices } from "@/lib/store/memory";

/**
 * `GET /api/services` — List service offerings (buying, selling, appraisal, etc.).
 *
 * @returns JSON `{ data: { services } }`.
 */
export async function GET() {
  return jsonOk({ services: listServices() });
}
