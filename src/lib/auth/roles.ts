/** True when JWT user carries an admin role in Supabase metadata (matches API `requireAdmin`). */
export function isAdminJwtUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}): boolean {
  const appRole = user.app_metadata?.role;
  if (typeof appRole === "string" && appRole.toLowerCase() === "admin") {
    return true;
  }

  const userRole = user.user_metadata?.role;
  if (typeof userRole === "string" && userRole.toLowerCase() === "admin") {
    return true;
  }

  const appRoles = user.app_metadata?.roles;
  if (
    Array.isArray(appRoles) &&
    appRoles.some((r) => typeof r === "string" && r.toLowerCase() === "admin")
  ) {
    return true;
  }

  return false;
}
