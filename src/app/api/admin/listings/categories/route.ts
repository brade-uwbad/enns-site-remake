import { revalidatePath } from "next/cache";

import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { getListingCategories, setListingCategories } from "@/lib/listings/listing-categories-store";
import { listingCategoriesUpdateSchema } from "@/lib/validations/listings";

/** `GET /api/admin/listings/categories` — current editable listing categories. */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  const categories = await getListingCategories();
  return jsonOk({ categories });
}

/** `PUT /api/admin/listings/categories` — save the listing categories (admin). */
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

  const parsed = listingCategoriesUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Validation failed", 400, "VALIDATION_ERROR", parsed.error.flatten());
  }

  try {
    const categories = await setListingCategories(parsed.data.categories);
    // Public pages read categories at request time; bust their caches.
    revalidatePath("/listings");
    revalidatePath("/listings/[id]", "page");
    return jsonOk({ categories });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save categories";
    return jsonError(message, 500, "CATEGORIES_ERROR");
  }
}
