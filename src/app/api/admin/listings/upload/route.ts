import { randomUUID } from "crypto";
import { jsonError, jsonOk } from "@/lib/api/http";
import { requireAdmin } from "@/lib/auth/admin";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function normalizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return jsonError(auth.message, auth.status, "UNAUTHORIZED");
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid form-data body", 400, "BAD_REQUEST");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("Expected a file field named 'file'", 400, "BAD_REQUEST");
  }
  if (!file.type.startsWith("image/")) {
    return jsonError("Only image uploads are supported", 400, "VALIDATION_ERROR");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return jsonError("Image exceeds 10MB limit", 400, "VALIDATION_ERROR");
  }

  try {
    const supabase = getSupabaseAdminClient();
    const bucket = process.env.STORAGE_SUPABASE_LISTINGS_BUCKET ?? "listing-images";
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const filePath = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${normalizeFilename(file.name || `image.${ext}`)}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, bytes, { contentType: file.type, upsert: false });
    if (uploadError) {
      return jsonError(uploadError.message, 500, "UPLOAD_ERROR");
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return jsonOk({ url: data.publicUrl, path: filePath, bucket });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to upload image";
    return jsonError(message, 500, "UPLOAD_ERROR");
  }
}
