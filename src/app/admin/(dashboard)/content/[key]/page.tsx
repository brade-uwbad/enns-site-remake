import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteContentEditor } from "@/components/admin/site-content-editor";
import { AdminChrome } from "@/components/admin/admin-ui";
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
    <AdminChrome maxWidth="3xl">
      <SiteContentEditor pageKey={key} initialPayload={row.payload} updatedAt={row.updatedAt} />
    </AdminChrome>
  );
}
