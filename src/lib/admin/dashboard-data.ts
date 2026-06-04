import { fetchRecentContactSubmissions } from "@/lib/contact/submissions";
import { getSupabaseReadClient, hasSupabaseReadConfig } from "@/lib/supabase/server";
import type { ContactSubmissionRow } from "@/lib/store/types";

export type ListingStatusCounts = {
  active: number;
  sold: number;
  total: number;
};

export type DashboardLead = Pick<
  ContactSubmissionRow,
  "id" | "name" | "email" | "phone" | "source" | "created_at" | "message"
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

/** Recent contact / valuation submissions (Supabase or in-memory fallback). */
export async function fetchRecentLeads(limit = 8): Promise<DashboardLead[]> {
  const rows = await fetchRecentContactSubmissions(limit);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    source: row.source,
    created_at: row.created_at,
    message: row.message,
  }));
}
