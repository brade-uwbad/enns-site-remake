import type { Metadata } from "next";
import { ListingsEditor } from "@/components/admin/listings-editor";
import { fetchListings } from "@/lib/listings/query";

export const metadata: Metadata = {
  title: "Admin Listings",
  description: "Create, edit, and delete listings.",
};

export default async function AdminListingsPage() {
  const [active, sold] = await Promise.all([
    fetchListings("active", { page: 1, limit: 100 }),
    fetchListings("sold", { page: 1, limit: 100 }),
  ]);
  return <ListingsEditor initialListings={[...active.items, ...sold.items]} />;
}
