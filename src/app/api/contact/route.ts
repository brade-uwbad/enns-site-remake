import { jsonError, jsonOk } from "@/lib/api/http";
import { clientIp, rateLimitContact } from "@/lib/rate-limit";
import { addContactSubmission } from "@/lib/store/memory";
import { contactFormSchema } from "@/lib/validations/contact";

/**
 * `POST /api/contact` — Accepts a general contact form; rate-limited per IP; stored in memory.
 *
 * @param request - JSON body validated by {@link contactFormSchema}.
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

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  const data = addContactSubmission({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    message: parsed.data.message,
    source: "contact",
  });

  return jsonOk({ submission: { id: data.id, created_at: data.created_at } }, { status: 201 });
}
