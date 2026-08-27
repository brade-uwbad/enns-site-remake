import { timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison for secrets (tokens, invite codes).
 *
 * Avoids leaking length/content via early-exit timing the way `===`/`!==` can.
 * Returns `false` for any null/undefined input and never throws on length mismatch.
 *
 * @param a - First value (e.g. the value supplied by the caller).
 * @param b - Second value (e.g. the configured secret).
 * @returns `true` only when both are non-empty strings of equal bytes.
 */
export function timingSafeStringEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) {
    return false;
  }
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}
