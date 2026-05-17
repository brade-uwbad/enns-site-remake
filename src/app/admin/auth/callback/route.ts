import { NextResponse } from "next/server";

import { isAdminJwtUser } from "@/lib/auth/roles";
import { createSupabaseServerAuthClient } from "@/lib/supabase/server-auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/listings";

  if (code) {
    const supabase = await createSupabaseServerAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const url = new URL("/admin/login", origin);
      url.searchParams.set("error", "otp_expired");
      return NextResponse.redirect(url);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && isAdminJwtUser(user)) {
      const destination = next.startsWith("/admin") || next.startsWith("/listings") ? next : "/listings";
      return NextResponse.redirect(new URL(destination, origin));
    }

    if (user) {
      await supabase.auth.signOut();
      const url = new URL("/admin/login", origin);
      url.searchParams.set("error", "not_admin");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.redirect(new URL("/admin/auth/confirm", origin));
}
