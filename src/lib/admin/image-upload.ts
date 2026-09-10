import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/** App-side cap kept below typical Supabase bucket defaults (50MB). */
export const MAX_ADMIN_IMAGE_BYTES = 40 * 1024 * 1024;

const MAX_ADMIN_IMAGE_MB = MAX_ADMIN_IMAGE_BYTES / (1024 * 1024);

export const ADMIN_IMAGE_UPLOAD_SIZE_HINT = `up to ${MAX_ADMIN_IMAGE_MB}MB`;

export const ADMIN_IMAGE_UPLOAD_LIMIT_MESSAGE = `Image exceeds ${MAX_ADMIN_IMAGE_MB}MB limit`;

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "avif",
  "heic",
  "heif",
  "bmp",
  "tif",
  "tiff",
]);

export function isLikelyAdminImage(contentType: string, fileName: string): boolean {
  if (contentType.startsWith("image/")) {
    return true;
  }
  const ext = fileName.includes(".") ? fileName.split(".").pop()?.toLowerCase() : "";
  return Boolean(ext && IMAGE_EXTENSIONS.has(ext));
}

function isLikelyImageFile(file: File): boolean {
  return isLikelyAdminImage(file.type, file.name);
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/** Returns a user-facing error message, or null when the file is acceptable. */
export function validateAdminImageFile(file: File): string | null {
  if (!isLikelyImageFile(file)) {
    return "Only image uploads are supported.";
  }
  if (file.size > MAX_ADMIN_IMAGE_BYTES) {
    return `${file.name} is ${formatFileSize(file.size)}. Please use an image ${ADMIN_IMAGE_UPLOAD_SIZE_HINT}.`;
  }
  return null;
}

export type AdminImageUploadTarget = "content" | "listings";

const PREPARE_UPLOAD_URL: Record<AdminImageUploadTarget, string> = {
  content: "/api/admin/content/upload",
  listings: "/api/admin/listings/upload",
};

export async function readUploadApiError(res: Response, fallback: string): Promise<string> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const data = await res.json();
      return (data?.error?.message as string | undefined) ?? fallback;
    } catch {
      return fallback;
    }
  }

  const text = (await res.text()).trim();
  if (text) {
    return text.length > 200 ? `${text.slice(0, 200)}…` : text;
  }
  return fallback;
}

export async function parseUploadApiResponse(
  res: Response,
  fallback: string,
): Promise<{ url: string; path: string; token: string; bucket: string }> {
  if (!res.ok) {
    throw new Error(await readUploadApiError(res, fallback));
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(await readUploadApiError(res, fallback));
  }

  const data = await res.json();
  const url = data?.data?.url;
  const path = data?.data?.path;
  const token = data?.data?.token;
  const bucket = data?.data?.bucket;
  if (
    typeof url !== "string" ||
    !url ||
    typeof path !== "string" ||
    !path ||
    typeof token !== "string" ||
    !token ||
    typeof bucket !== "string" ||
    !bucket
  ) {
    throw new Error(fallback);
  }
  return { url, path, token, bucket };
}

/**
 * Uploads an admin image via a signed Supabase URL so file bytes bypass Vercel's
 * serverless request body limit. Returns the public Storage URL.
 */
export async function uploadAdminImageFile(
  file: File,
  target: AdminImageUploadTarget,
  accessToken?: string | null,
): Promise<{ url: string }> {
  const validationError = validateAdminImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const prepareRes = await fetch(PREPARE_UPLOAD_URL[target], {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });
  const { url, path, token, bucket } = await parseUploadApiResponse(
    prepareRes,
    `Could not upload ${file.name}`,
  );

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }

  return { url };
}
