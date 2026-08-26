import type { Metadata } from "next";

import { ListingsEditor } from "@/components/admin/listings-editor";
import { fetchListings } from "@/lib/listings/query";
import { getListingCategories } from "@/lib/listings/listing-categories-store";
import { getShowNearbyListings } from "@/lib/settings/nearby-listings";

export const metadata: Metadata = {
  title: "Admin Listings",
  description: "Create, edit, and delete listings.",
};

export const dynamic = "force-dynamic";

type AdminListingsPageProps = {
  searchParams: Promise<{ create?: string; edit?: string }>;
};

export default async function AdminListingsPage({ searchParams }: AdminListingsPageProps) {
  const params = await searchParams;
  const startCreate = params.create === "1";
  const startEditId = typeof params.edit === "string" ? params.edit : undefined;

  const [active, sold, showNearbyListings, categories] = await Promise.all([
    fetchListings("active", { page: 1, limit: 100 }),
    fetchListings("sold", { page: 1, limit: 100 }),
    getShowNearbyListings(),
    getListingCategories(),
  ]);

  return (
    <ListingsEditor
      key={`${startCreate}-${startEditId ?? ""}`}
      initialListings={[...active.items, ...sold.items]}
      categories={categories}
      startCreate={startCreate}
      startEditId={startEditId}
      showNearbyListings={showNearbyListings}
    />
  );
}
