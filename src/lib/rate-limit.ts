type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 5;

/**
 * Applies a fixed-window rate limit for contact-related POST endpoints, keyed by client IP.
 *
 * @param ip - Client identifier (typically from {@link clientIp}).
 * @returns `ok: true` if the request is allowed, or `ok: false` with `retryAfterSec` when limited.
 *
 * @remarks
 * State is stored in memory per server process only. Use Redis or an edge KV in production.
 */
export function rateLimitContact(ip: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const key = `contact:${ip}`;
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, b);
  }
  b.count += 1;
  if (b.count > MAX_REQUESTS) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true };
}

/**
 * Best-effort client IP for rate limiting and logging behind proxies.
 *
 * @param request - Incoming request; reads `x-forwarded-for` (first hop) or `x-real-ip`.
 * @returns IP string, or `"unknown"` if headers are absent.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}
