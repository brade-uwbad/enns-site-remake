"use client";

import Link from "next/link";

type SiteHeaderCtaProps = {
  className?: string;
};

export function SiteHeaderCta({ className }: SiteHeaderCtaProps) {
  return (
    <Link href="/contact" className={className}>
      Get in touch
    </Link>
  );
}
