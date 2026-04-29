import { jsonError, jsonOk } from "@/lib/api/http";
import { clientIp, rateLimitContact } from "@/lib/rate-limit";
import { addContactSubmission } from "@/lib/store/memory";
import { valuationFormSchema } from "@/lib/validations/contact";

/**
 * `POST /api/contact/valuation` — Home valuation / appraisal request; rate-limited; stored with `source: "valuation"`.
 *
 * @param request - JSON validated by {@link valuationFormSchema}; optional `address` is prepended to `message`.
 * @returns JSON `{ data: { submission: { id, created_at } } }` with HTTP 201, or 429 / validation errors.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimitContact(ip);
  if (!limited.ok) {
    return jsonError("Too many requests", 429, "RATE_LIMITED", {
      retryAfterSec: limited.retryAfterSec,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = valuationFormSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  const message = parsed.data.address
    ? `Property: ${parsed.data.address}\n\n${parsed.data.message}`
    : parsed.data.message;

  const data = addContactSubmission({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message,
    source: "valuation",
  });

  return jsonOk({ submission: { id: data.id, created_at: data.created_at } }, { status: 201 });
}
