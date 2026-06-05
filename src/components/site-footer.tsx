import Link from "next/link";

import { fetchSiteContent } from "@/lib/content/query";

export async function SiteFooter() {
  const { payload } = await fetchSiteContent("footer");

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-zinc-600">
          © {new Date().getFullYear()} {payload.copyright}
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/contact" className="text-zinc-600 hover:text-zinc-900">
            Contact
          </Link>
          <a
            href={payload.facebookUrl}
            className="text-zinc-600 hover:text-zinc-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            href={payload.linkedinUrl}
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
