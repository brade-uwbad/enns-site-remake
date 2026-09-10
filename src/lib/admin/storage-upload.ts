import { randomUUID } from "crypto";

import {
  ADMIN_IMAGE_UPLOAD_LIMIT_MESSAGE,
  isLikelyAdminImage,
  MAX_ADMIN_IMAGE_BYTES,
} from "@/lib/admin/image-upload";
import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

function normalizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildAdminUploadPath(fileName: string) {
  const ext = fileName.includes(".") ? fileName.split(".").pop() : "jpg";
  const safeName = normalizeFilename(fileName || `image.${ext}`);
  return `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;
}

export function getSiteImagesBucket() {
  return process.env.STORAGE_SUPABASE_SITE_IMAGES_BUCKET ?? "site-images";
}

export function getListingImagesBucket() {
  return process.env.STORAGE_SUPABASE_LISTINGS_BUCKET ?? "listing-images";
}

type PrepareAdminUploadInput = {
  request: Request;
  bucket: string;
};

/**
 * Admin-only: mint a Supabase signed upload URL so the browser can upload
 * directly to Storage without sending file bytes through Vercel Functions.
 */
export async function prepareAdminSignedUpload({ request, bucket }: PrepareAdminUploadInput) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  let body: { fileName?: string; contentType?: string; size?: number };
  try {
    body = (await request.json()) as { fileName?: string; contentType?: string; size?: number };
  } catch {
    return jsonError("Invalid JSON body", 400, "BAD_REQUEST");
  }

  const fileName = body.fileName?.trim();
  const contentType = body.contentType?.trim() ?? "";
  const size = body.size;
  if (!fileName) {
    return jsonError("fileName is required", 400, "BAD_REQUEST");
  }
  if (!isLikelyAdminImage(contentType, fileName)) {
    return jsonError("Only image uploads are supported", 400, "VALIDATION_ERROR");
  }
  if (typeof size === "number" && size > MAX_ADMIN_IMAGE_BYTES) {
    return jsonError(ADMIN_IMAGE_UPLOAD_LIMIT_MESSAGE, 400, "VALIDATION_ERROR");
  }

  try {
    const supabase = getSupabaseAdminClient();
    const filePath = buildAdminUploadPath(fileName);
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(filePath);
    if (error || !data?.token) {
      return jsonError(error?.message ?? "Failed to create upload URL", 500, "UPLOAD_ERROR");
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return jsonOk({
      path: filePath,
      token: data.token,
      bucket,
      url: publicData.publicUrl,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to prepare upload";
    return jsonError(message, 500, "UPLOAD_ERROR");
  }
}
