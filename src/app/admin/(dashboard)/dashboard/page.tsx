import type { Metadata } from "next";

import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview";
import { AdminChrome, AdminPageHeader } from "@/components/admin/admin-ui";
import { fetchListingStatusCounts, fetchRecentLeads } from "@/lib/admin/dashboard-data";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Listing overview and recent leads.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [counts, leads] = await Promise.all([fetchListingStatusCounts(), fetchRecentLeads(8)]);

  return (
    <AdminChrome maxWidth="3xl">
      <AdminPageHeader
        title="Dashboard"
        description="Listing counts, site content, reviews, and contact form inquiries."
      />
      <AdminDashboardOverview counts={counts} leads={leads} />
    </AdminChrome>
  );
}
