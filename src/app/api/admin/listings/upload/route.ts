import { getListingImagesBucket, prepareAdminSignedUpload } from "@/lib/admin/storage-upload";

/** `POST /api/admin/listings/upload` — Mint a signed upload URL for listing photos. */
export async function POST(request: Request) {
  return prepareAdminSignedUpload({ request, bucket: getListingImagesBucket() });
}
