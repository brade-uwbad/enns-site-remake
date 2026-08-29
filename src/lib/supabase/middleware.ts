import { type NextRequest, NextResponse } from "next/server";

import { isAdminAuthBypassEnabled } from "@/lib/auth/admin-bypass";
import { hasSupabaseSessionConfig } from "@/lib/supabase/public-config";

/**
 * Lightweight admin middleware. Auth checks run in server layouts via `requireAdminSession`
 * because Supabase Auth network calls on Vercel Edge can hang until the 25s middleware timeout.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicAuthRoute = isAdminPublicAuthRoute(pathname);

  if (isAdminAuthBypassEnabled()) {
    return NextResponse.next();
  }

  if (!hasSupabaseSessionConfig() && !isPublicAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

function isAdminPublicAuthRoute(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return true;
  }
  if (pathname.startsWith("/admin/forgot-password")) {
    return true;
  }
  if (pathname.startsWith("/admin/auth/")) {
    return true;
  }
  return false;
}
