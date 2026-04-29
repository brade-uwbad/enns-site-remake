import type { Metadata } from "next";
import { ListingsEditor } from "@/components/admin/listings-editor";

export const metadata: Metadata = {
  title: "Admin Listings",
  description: "Create, edit, and delete listings.",
};

export default function AdminListingsPage() {
  return <ListingsEditor />;
}
