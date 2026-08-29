/** Vercel serverless request bodies are capped at 4.5MB; stay under that with multipart overhead. */
export const MAX_ADMIN_IMAGE_BYTES = 4 * 1024 * 1024;

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

function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) {
    return true;
  }
  const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "";
  return Boolean(ext && IMAGE_EXTENSIONS.has(ext));
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
    return `${file.name} is ${formatFileSize(file.size)}. Please use an image ${ADMIN_IMAGE_UPLOAD_SIZE_HINT} (compress or export as JPG).`;
  }
  return null;
}

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
  if (res.status === 413 || /request entity too large/i.test(text)) {
    return `Image is too large for upload. Please use a file ${ADMIN_IMAGE_UPLOAD_SIZE_HINT}.`;
  }
  if (text) {
    return text.length > 200 ? `${text.slice(0, 200)}…` : text;
  }
  return fallback;
}

export async function parseUploadApiResponse(
  res: Response,
  fallback: string,
): Promise<{ url: string }> {
  if (!res.ok) {
    throw new Error(await readUploadApiError(res, fallback));
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(await readUploadApiError(res, fallback));
  }

  const data = await res.json();
  const url = data?.data?.url;
  if (typeof url !== "string" || !url) {
    throw new Error(fallback);
  }
  return { url };
}
