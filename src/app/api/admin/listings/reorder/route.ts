import { revalidatePath } from "next/cache";

import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { reorderAdminListings } from "@/lib/listings/admin";
import { listingReorderSchema } from "@/lib/validations/listings";

/** `PUT /api/admin/listings/reorder` — save manual listing order for active or sold listings. */
export async function PUT(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const parsed = listingReorderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  try {
    await reorderAdminListings(parsed.data.status, parsed.data.ids);
    revalidatePath("/listings");
    revalidatePath("/admin/listings");
    return jsonOk({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to reorder listings";
    return jsonError(message, 500, "LISTINGS_ERROR");
  }
}
