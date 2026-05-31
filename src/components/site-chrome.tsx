"use client";

import { usePathname } from "next/navigation";

import { AuthLandingRedirect } from "@/components/auth/auth-landing-redirect";
import { SiteHeader } from "@/components/site-header";

/** Admin sign-in / sign-up / password recovery: no marketing footer. */
function isAdminAuthChromePath(pathname: string): boolean {
  if (pathname === "/admin/login" || pathname === "/admin/register") {
    return true;
  }
  if (pathname.startsWith("/admin/forgot-password")) {
    return true;
  }
  if (pathname === "/admin/auth/confirm") {
    return true;
  }
  return false;
}

export function SiteChrome({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideFooter = isAdminAuthChromePath(pathname);

  return (
    <>
      <AuthLandingRedirect />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      {!hideFooter ? footer : null}
    </>
  );
}
