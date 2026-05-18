import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isAdminAuthBypassEnabled } from "@/lib/auth/admin-bypass";
import { isAdminJwtUser } from "@/lib/auth/roles";
import { getSupabaseAnonKey, getSupabaseUrl, hasSupabaseSessionConfig } from "@/lib/supabase/public-config";


/**
 * Refreshes the Supabase session from cookies and enforces admin-only access to `/admin` (except `/admin/login`).
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAuthRoute = isAdminPublicAuthRoute(pathname);

  if (!isAdminArea) {
    return NextResponse.next();
  }

  if (isAdminAuthBypassEnabled()) {
    return NextResponse.next();
  }

  if (!hasSupabaseSessionConfig()) {
    if (isPublicAuthRoute) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("error", "config");
    return NextResponse.redirect(url);
  }

  const supabaseUrl = getSupabaseUrl()!;
  const supabaseAnonKey = getSupabaseAnonKey()!;

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isPublicAuthRoute) {
    if (user && isAdminJwtUser(user) && pathname === "/admin/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard";
      url.searchParams.delete("error");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (!user || !isAdminJwtUser(user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
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
