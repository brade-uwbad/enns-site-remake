import type { Metadata } from "next";
import Link from "next/link";

import { SITE_CONTENT_PAGES } from "@/lib/content/keys";

export const metadata: Metadata = {
  title: "Site content",
  description: "Edit marketing page copy.",
};

export default function AdminContentHubPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Site content</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Edit text on the main marketing pages. Changes appear on the live site without a redeploy.
          </p>
        </div>

        <ul className="space-y-3">
          {SITE_CONTENT_PAGES.map((page) => (
            <li key={page.key}>
              <Link
                href={`/admin/content/${page.key}`}
                className="block rounded-lg border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-[#4a6d95]/40 hover:bg-zinc-50"
              >
                <p className="font-medium text-[#140000]">{page.label}</p>
                <p className="mt-1 text-sm text-zinc-600">{page.description}</p>
                <p className="mt-2 text-xs text-zinc-500">Public: {page.publicPath}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-sm text-zinc-500">
          Listing photos and pricing are managed under{" "}
          <Link href="/admin/listings" className="font-medium text-[#4a6d95] hover:underline">
            Listings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
