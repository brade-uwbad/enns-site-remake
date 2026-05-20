/** User-facing copy for common Supabase Auth errors. */
export function formatAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Supabase has temporarily blocked more auth emails for this project (sign-up, password reset, and similar). Wait about an hour, then try again. For development, raise limits under Authentication → Rate limits, set up custom SMTP, or create the user manually in the Supabase dashboard.";
  }
  if (lower.includes("auth session missing") || lower.includes("session missing")) {
    return "This reset link has expired or was already used. Request a new password reset email and open the newest link within about an hour.";
  }
  if (lower.includes("otp_expired") || lower.includes("invalid or has expired")) {
    return "This email link has expired or was already used. Create your account again or sign in if you already confirmed.";
  }
  if (lower === "not_admin") {
    return "This account does not have admin access.";
  }
  return message;
}
