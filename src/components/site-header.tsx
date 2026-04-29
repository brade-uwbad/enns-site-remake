import Link from "next/link";

/** Primary navigation targets for the marketing site. */
const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/listings", label: "Listings" },
  { href: "/admin/listings", label: "Admin" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Top navigation: brand, primary links (desktop), and a contact call-to-action.
 *
 * @returns Header markup for the site shell.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Brad Enns
          <span className="ml-1.5 text-sm font-normal text-zinc-500 dark:text-zinc-400">
            Real Estate
          </span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Get in touch
        </Link>
      </div>
    </header>
  );
}
