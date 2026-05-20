import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/listings", label: "Listings" },
  { href: "/contact", label: "Contact" },
] as const;

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

        <nav
          className={`absolute left-1/2 hidden -translate-x-1/2 items-center sm:flex ${poppins.className}`}
          style={{ columnGap: "2.5rem" }}
          aria-label="Main"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-2 text-base font-normal text-[#140000] transition-all hover:font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer balances the logo column so centered nav stays visually centered */}
        <div className="w-[106px] shrink-0 sm:hidden" aria-hidden />
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
