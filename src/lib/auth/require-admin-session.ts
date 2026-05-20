import { redirect } from "next/navigation";

import { isAdminAuthBypassEnabled } from "@/lib/auth/admin-bypass";
import { isAdminJwtUser } from "@/lib/auth/roles";
import { hasSupabaseSessionConfig } from "@/lib/supabase/public-config";
import { createSupabaseServerAuthClient } from "@/lib/supabase/server-auth";

/**
 * Server-only gate for admin dashboard pages.
 * Uses the Supabase session cookie (JWT), not a separate app token.
 */
export async function requireAdminSession(loginRedirectPath?: string) {
  if (isAdminAuthBypassEnabled()) {
    return null;
  }

  if (!hasSupabaseSessionConfig()) {
    redirect("/admin/login?error=config");
  }

  const supabase = await createSupabaseServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminJwtUser(user)) {
    const target = loginRedirectPath ?? "/admin/login";
    if (target.startsWith("/admin/login")) {
      redirect(target);
    }
    redirect(`/admin/login?redirect=${encodeURIComponent(target)}`);
  }

  return user;
}
