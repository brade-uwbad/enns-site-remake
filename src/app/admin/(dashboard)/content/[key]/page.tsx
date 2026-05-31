import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteContentEditor } from "@/components/admin/site-content-editor";
import { isSiteContentKey } from "@/lib/content/keys";
import { SITE_CONTENT_PAGES } from "@/lib/content/keys";
import { fetchSiteContent } from "@/lib/content/query";

type Params = { params: Promise<{ key: string }> };

export async function generateMetadata(ctx: Params): Promise<Metadata> {
  const { key } = await ctx.params;
  const page = SITE_CONTENT_PAGES.find((p) => p.key === key);
  return {
    title: page ? `Edit ${page.label}` : "Edit content",
    description: "Edit marketing page copy.",
  };
}

export default async function AdminContentEditPage(ctx: Params) {
  const { key } = await ctx.params;
  if (!isSiteContentKey(key)) {
    notFound();
  }

  const row = await fetchSiteContent(key);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <SiteContentEditor
          pageKey={key}
          initialPayload={row.payload}
          updatedAt={row.updatedAt}
        />
      </div>
    </div>
  );
}
