/** Masks an email for display (e.g. br****ns@gmail.com). */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) {
    return email;
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length <= 2) {
    return `${local[0] ?? ""}****@${domain}`;
  }
  const head = local.slice(0, 2);
  const tail = local.slice(-2);
  const stars = "*".repeat(Math.min(Math.max(local.length - 4, 2), 6));
  return `${head}${stars}${tail}@${domain}`;
}
