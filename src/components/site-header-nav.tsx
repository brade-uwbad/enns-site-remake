"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAdminUser } from "@/hooks/use-admin-user";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/listings", label: "Listings" },
] as const;

type SiteHeaderNavProps = {
  className?: string;
  linkClassName?: string;
};

export function SiteHeaderNav({ className, linkClassName }: SiteHeaderNavProps) {
  const pathname = usePathname();
  const { admin } = useAdminUser();

  return (
    <nav className={className} style={{ columnGap: "2.5rem" }} aria-label="Main">
      {nav.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${linkClassName ?? ""} ${index > 0 ? "ml-8" : ""}`}
        >
          {item.label}
        </Link>
      ))}
      {admin ? (
        <Link
          href="/admin/dashboard"
          className={`${linkClassName ?? ""} ml-8 ${
            pathname.startsWith("/admin/dashboard") ? "font-medium" : ""
          }`}
        >
          Dashboard
        </Link>
      ) : null}
    </nav>
  );
}
