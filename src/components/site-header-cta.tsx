"use client";

import Link from "next/link";

import { AdminHeaderAccount } from "@/components/admin/admin-header-account";

type SiteHeaderCtaProps = {
  className?: string;
};

export function SiteHeaderCta({ className }: SiteHeaderCtaProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <AdminHeaderAccount />
      <Link href="/contact" className={className}>
        Get in touch
      </Link>
    </div>
  );
}
