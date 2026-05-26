/**
 * Local-only escape hatch. Ignored in production builds even if the env var is set.
 */
export function isAdminAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" && process.env.ADMIN_UI_BYPASS_AUTH === "true"
  );
}
