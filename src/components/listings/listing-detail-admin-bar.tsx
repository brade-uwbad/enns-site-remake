"use client";

import { ListingAdminActions } from "@/components/listings/listing-admin-actions";
import { useAdminUser } from "@/hooks/use-admin-user";

type ListingDetailAdminBarProps = {
  listingId: string;
  status: "active" | "sold" | "draft";
};

export function ListingDetailAdminBar({ listingId, status }: ListingDetailAdminBarProps) {
  const { loading, admin } = useAdminUser();
  if (loading || !admin) {
    return null;
  }
  return (
    <div className="w-full">
      <ListingAdminActions listingId={listingId} status={status} />
    </div>
  );
}
