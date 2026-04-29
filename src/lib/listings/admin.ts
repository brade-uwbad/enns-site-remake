import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import {
  deleteListingById as deleteListingMemory,
  getListingById as getListingMemory,
  insertListing as insertListingMemory,
  updateListingById as updateListingMemory,
} from "@/lib/store/memory";
import type { ListingRow } from "@/lib/store/types";

export async function createAdminListing(row: Omit<ListingRow, "id" | "created_at" | "updated_at">) {
  if (!hasSupabaseAdminConfig()) {
    return insertListingMemory(row);
  }
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("listings").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as ListingRow;
}

export async function getAdminListingById(id: string) {
  if (!hasSupabaseAdminConfig()) {
    return getListingMemory(id);
  }
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ListingRow | null) ?? null;
}

export async function updateAdminListingById(id: string, patch: Partial<ListingRow>) {
  if (!hasSupabaseAdminConfig()) {
    return updateListingMemory(id, patch);
  }
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("listings").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ListingRow | null) ?? null;
}

export async function deleteAdminListingById(id: string) {
  if (!hasSupabaseAdminConfig()) {
    return deleteListingMemory(id);
  }
  const supabase = getSupabaseAdminClient();
  const { error, count } = await supabase.from("listings").delete({ count: "exact" }).eq("id", id);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
