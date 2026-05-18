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
 * Top navigation: brand, primary links (desktop), and a contact call-to-action.
 *
 * @returns Header markup for the site shell.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="Brad Enns Real Estate home">
          <Image
            src="/logo.svg"
            alt="Brad Enns Real Estate logo"
            width={104}
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
    </header>
  );
}
