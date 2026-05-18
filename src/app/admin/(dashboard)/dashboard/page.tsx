import type { Metadata } from "next";

import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";
import { fetchListingStatusCounts, fetchRecentLeads } from "@/lib/admin/dashboard-data";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Listing overview and recent leads.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [counts, leads] = await Promise.all([
    fetchListingStatusCounts(),
    Promise.resolve(fetchRecentLeads(8)),
  ]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        </div>
        <AdminDashboardOverview counts={counts} leads={leads} />
      </div>
    </div>
  );
}
