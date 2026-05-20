import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

import { SiteHeaderCta } from "@/components/site-header-cta";
import { SiteHeaderNav } from "@/components/site-header-nav";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

/**
 * Top navigation: dual logos, centered links, Contact in the main nav (Figma home layout).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="relative z-10 shrink-0" aria-label="Brad Enns Real Estate home">
          <Image
            src="/logo.svg"
            alt="Brad Enns Real Estate logo"
            width={106}
            height={24}
            priority
            className="h-6 w-auto"
          />
        </Link>
        <SiteHeaderNav
          className={`hidden items-center sm:flex ${poppins.className}`}
          linkClassName="px-2 py-2 text-base font-normal text-[#140000] transition-all hover:font-medium"
        />
        <SiteHeaderCta
          className={`rounded-full bg-[#070101] px-4 py-2 text-base font-normal text-white transition-colors hover:bg-[#070101ef] ${poppins.className}`}
        />
      </div>

      <nav
        className={`flex items-center justify-center gap-6 overflow-x-auto border-t border-zinc-100 px-4 py-2 sm:hidden ${poppins.className}`}
        aria-label="Main mobile"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 py-1 text-sm font-normal text-[#140000]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
