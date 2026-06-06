import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

import { AdminHeaderAccount } from "@/components/admin/admin-header-account";
import { SiteHeaderCta } from "@/components/site-header-cta";
import { SiteHeaderMobileNav, SiteHeaderNav } from "@/components/site-header-nav";

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
      <div className="relative min-h-16 w-full">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
          <Link href="/" className="relative z-10 shrink-0" aria-label="Brad Enns Real Estate home">
            <Image
              src="/logo.svg"
              alt="Brad Enns Real Estate logo"
              width={106}
              height={24}
              priority
              className="h-5 w-auto sm:h-6"
            />
          </Link>
          <SiteHeaderNav
            className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center sm:flex ${poppins.className}`}
            linkClassName="px-2 py-2 text-base font-normal text-[#140000] transition-all hover:font-medium"
          />
          <div className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3">
            <SiteHeaderCta
              className={`shrink-0 rounded-full bg-[#070101] px-3 py-1.5 text-sm font-normal text-white transition-colors hover:bg-[#070101ef] sm:px-4 sm:py-2 sm:text-base ${poppins.className}`}
            />
            <div className="sm:hidden">
              <AdminHeaderAccount />
            </div>
          </div>
        </div>
        <div className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 sm:right-[50px] sm:block">
          <AdminHeaderAccount />
        </div>
      </div>

      <SiteHeaderMobileNav
        className={`flex items-center justify-center gap-4 overflow-x-auto border-t border-zinc-100 px-4 py-2.5 sm:hidden ${poppins.className}`}
        linkClassName="shrink-0 whitespace-nowrap py-1 text-sm font-normal text-[#140000]"
      />
    </header>
  );
}
