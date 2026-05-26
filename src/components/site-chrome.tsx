"use client";

import { usePathname } from "next/navigation";

import { AuthLandingRedirect } from "@/components/auth/auth-landing-redirect";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Admin pages use the marketing header, but not the public marketing footer. */
function isAdminChromePath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = isAdminChromePath(pathname);

  return (
    <>
      <AuthLandingRedirect />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {!hideFooter ? <SiteFooter /> : null}
    </>
  );
}
