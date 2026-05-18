import { getSupabaseReadClient, hasSupabaseReadConfig } from "@/lib/supabase/server";
import { listRecentContactSubmissions } from "@/lib/store/memory";
import type { ContactSubmissionRow } from "@/lib/store/types";

export type ListingStatusCounts = {
  active: number;
  sold: number;
  total: number;
};

export type DashboardLead = Pick<
  ContactSubmissionRow,
  "id" | "name" | "email" | "source" | "created_at" | "message"
>;

async function countListingsByStatus(status: "active" | "sold"): Promise<number> {
  const supabase = getSupabaseReadClient();
  const { count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", status);
  if (error) {
    throw new Error(error.message);
  }
  return count ?? 0;
}

async function fetchListingStatusCountsFromDb(): Promise<ListingStatusCounts> {
  const [active, sold] = await Promise.all([
    countListingsByStatus("active"),
    countListingsByStatus("sold"),
  ]);
  return { active, sold, total: active + sold };
}

async function fetchListingStatusCountsFromMemory(): Promise<ListingStatusCounts> {
  const { countListingsByStatus } = await import("@/lib/store/memory");
  return countListingsByStatus();
}

export async function fetchListingStatusCounts(): Promise<ListingStatusCounts> {
  if (hasSupabaseReadConfig()) {
    return fetchListingStatusCountsFromDb();
  }
  return fetchListingStatusCountsFromMemory();
}

/** Recent contact / valuation submissions (in-memory store until a DB table exists). */
export function fetchRecentLeads(limit = 8): DashboardLead[] {
  return listRecentContactSubmissions(limit);
}
