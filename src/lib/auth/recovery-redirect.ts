/** Where Supabase should send users after they click the reset link in email. */
export function getPasswordRecoveryRedirectUrl(origin: string): string {
  return `${origin}/admin/auth/confirm`;
}
