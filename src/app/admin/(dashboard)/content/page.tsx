import type { Metadata } from "next";
import Link from "next/link";

import { adminLinkClass, AdminChrome, AdminPageHeader } from "@/components/admin/admin-ui";
import { SITE_CONTENT_PAGES } from "@/lib/content/keys";

export const metadata: Metadata = {
  title: "Site content",
  description: "Edit marketing page copy.",
};

export default function AdminContentHubPage() {
  return (
    <AdminChrome maxWidth="3xl">
      <AdminPageHeader
        breadcrumb={
          <Link href="/admin/dashboard" className={adminLinkClass}>
            ← Back to dashboard
          </Link>
        }
        title="Site content"
        description="Edit text on the main marketing pages. Changes appear on the live site without a redeploy."
      />

      <ul className="mx-auto max-w-3xl space-y-5">
        {SITE_CONTENT_PAGES.map((page) => (
          <li key={page.key}>
            <Link
              href={`/admin/content/${page.key}`}
              className="block w-full rounded-lg border border-slate-300 bg-white p-5 text-left transition hover:border-slate-400"
            >
              <p className="text-base font-semibold text-slate-900">{page.label}</p>
              <div className="mt-3 rounded-md bg-slate-100 px-4 py-3">
                <p className="text-sm text-slate-600">{page.description}</p>
                <p className="mt-2 text-xs text-slate-500">Public: {page.publicPath}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-slate-600">
        Listing photos and pricing are managed under{" "}
        <Link href="/admin/listings" className={adminLinkClass}>
          Listings
        </Link>
        .
      </p>
    </AdminChrome>
  );
}
