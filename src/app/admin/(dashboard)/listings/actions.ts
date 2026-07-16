"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth/require-admin-session";
import { setShowNearbyListings } from "@/lib/settings/nearby-listings";

/**
 * Enables or disables the "More listings nearby" section site-wide. Admin only.
 * Revalidates the admin listings page and public listing detail pages so the
 * change takes effect immediately.
 */
export async function setNearbyListingsEnabled(enabled: boolean): Promise<void> {
  await requireAdminSession("/admin/listings");
  await setShowNearbyListings(enabled);

  revalidatePath("/admin/listings");
  revalidatePath("/listings/[id]", "page");
}
