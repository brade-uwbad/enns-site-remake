/** Metadata applied to accounts created via the admin registration flow. */
export function buildAdminUserMetadata(firstName: string, lastName: string) {
  return {
    app_metadata: { role: "admin" as const },
    user_metadata: {
      role: "admin",
      first_name: firstName,
      last_name: lastName,
    },
  };
}
