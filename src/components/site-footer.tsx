import Link from "next/link";

/**
 * Public marketing footer with copyright and quick links.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-zinc-600">
          © {new Date().getFullYear()} Brad Enns. Kitchener-Waterloo & area.
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/contact" className="text-zinc-600 hover:text-zinc-900">
            Contact
          </Link>
          <a
            href="https://www.facebook.com"
            className="text-zinc-600 hover:text-zinc-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://www.linkedin.com"
            className="text-zinc-600 hover:text-zinc-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
