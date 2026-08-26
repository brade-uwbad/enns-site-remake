import type { Metadata } from "next";

import { CategoriesEditor } from "@/components/admin/categories-editor";
import { AdminChrome } from "@/components/admin/admin-ui";
import { getListingCategories } from "@/lib/listings/listing-categories-store";

export const metadata: Metadata = {
  title: "Listing categories",
  description: "Add, remove, and rename listing categories.",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getListingCategories();

  return (
    <AdminChrome maxWidth="3xl">
      <CategoriesEditor initialCategories={categories} />
    </AdminChrome>
  );
}
