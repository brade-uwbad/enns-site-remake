import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import {
  deleteListingById as deleteListingMemory,
  getListingById as getListingMemory,
  insertListing as insertListingMemory,
  reorderListingsByStatus as reorderListingsByStatusMemory,
  updateListingById as updateListingMemory,
} from "@/lib/store/memory";
import { normalizeListingRow } from "@/lib/listings/normalize-listing";
import type { ListingRow } from "@/lib/store/types";

export async function createAdminListing(
  row: Omit<ListingRow, "id" | "created_at" | "updated_at" | "display_order">,
) {
  if (!hasSupabaseAdminConfig()) {
    return insertListingMemory(row);
  }
  const supabase = getSupabaseAdminClient();
  let display_order = 1;
  const { data: orderRow, error: orderError } = await supabase
    .from("listings")
    .select("display_order")
    .eq("status", row.status)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (orderError && !orderError.message.includes("display_order")) {
    throw new Error(orderError.message);
  }
  if (!orderError) {
    const current = orderRow?.display_order;
    const n = typeof current === "number" ? current : Number(current ?? 0);
    display_order = (Number.isFinite(n) ? n : 0) + 1;
  }

  const insertRow = orderError ? row : { ...row, display_order };
  const { data, error } = await supabase.from("listings").insert(insertRow).select("*").single();
  if (error) {
    throw new Error(error.message);
  }
  return normalizeListingRow(data as Record<string, unknown>);
}

export async function getAdminListingById(id: string) {
  if (!hasSupabaseAdminConfig()) {
    return getListingMemory(id);
  }
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? normalizeListingRow(data as Record<string, unknown>) : null;
}

export async function updateAdminListingById(id: string, patch: Partial<ListingRow>) {
  if (!hasSupabaseAdminConfig()) {
    return updateListingMemory(id, patch);
  }
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .update(patch)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ? normalizeListingRow(data as Record<string, unknown>) : null;
}

export async function deleteAdminListingById(id: string) {
  if (!hasSupabaseAdminConfig()) {
    return deleteListingMemory(id);
  }
  const supabase = getSupabaseAdminClient();
  const { error, count } = await supabase.from("listings").delete({ count: "exact" }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  return (count ?? 0) > 0;
}

export async function reorderAdminListings(status: "active" | "sold", ids: string[]) {
  if (!hasSupabaseAdminConfig()) {
    reorderListingsByStatusMemory(status, ids);
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("listings").select("id").eq("status", status);
  if (error) {
    throw new Error(error.message);
  }

  const existingIds = new Set((data ?? []).map((row) => row.id as string));
  if (existingIds.size !== ids.length || !ids.every((id) => existingIds.has(id))) {
    throw new Error("Reorder payload must include every listing in this status group.");
  }

  const updates = ids.map((id, index) =>
    supabase
      .from("listings")
      .update({ display_order: index + 1 })
      .eq("id", id)
      .eq("status", status),
  );
  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    if (failed.error.message.includes("display_order") && failed.error.message.includes("does not exist")) {
      throw new Error(
        "Listing order is not enabled yet. Run the display_order migration in Supabase first.",
      );
    }
    throw new Error(failed.error.message);
  }
}
