"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAdminUser } from "@/hooks/use-admin-user";

export const siteHeaderNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/listings", label: "Listings" },
] as const;

type SiteHeaderNavProps = {
  className?: string;
  linkClassName?: string;
};

function AdminDashboardLink({
  linkClassName,
  className = "",
}: {
  linkClassName?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const { admin } = useAdminUser();

  if (!admin) {
    return null;
  }

  return (
    <Link
      href="/admin/dashboard"
      className={`${linkClassName ?? ""} ${className} ${
        pathname.startsWith("/admin/dashboard") ? "font-medium" : ""
      }`}
    >
      Dashboard
    </Link>
  );
}

export function SiteHeaderNav({ className, linkClassName }: SiteHeaderNavProps) {
  return (
    <nav className={className} style={{ columnGap: "2.5rem" }} aria-label="Main">
      {siteHeaderNavItems.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${linkClassName ?? ""} ${index > 0 ? "ml-8" : ""}`}
        >
          {item.label}
        </Link>
      ))}
      <AdminDashboardLink linkClassName={linkClassName} className="ml-8" />
    </nav>
  );
}

export function SiteHeaderMobileNav({ className, linkClassName }: SiteHeaderNavProps) {
  return (
    <nav className={className} aria-label="Main mobile">
      {siteHeaderNavItems.map((item) => (
        <Link key={item.href} href={item.href} className={linkClassName}>
          {item.label}
        </Link>
      ))}
      <AdminDashboardLink linkClassName={linkClassName} />
    </nav>
  );
}
