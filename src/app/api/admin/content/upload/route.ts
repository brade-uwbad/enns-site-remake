import { getSiteImagesBucket, prepareAdminSignedUpload } from "@/lib/admin/storage-upload";

/**
 * `POST /api/admin/content/upload` — Mint a signed upload URL for editable site
 * content images (e.g. the homepage hero background). The browser uploads directly
 * to the public `site-images` bucket and uses the returned public URL.
 */
export async function POST(request: Request) {
  return prepareAdminSignedUpload({ request, bucket: getSiteImagesBucket() });
}
