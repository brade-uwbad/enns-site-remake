import { revalidatePath } from "next/cache";

import type { SiteContentKey } from "@/lib/content/keys";
import { SITE_CONTENT_PAGES } from "@/lib/content/keys";

const MARKETING_PATHS = ["/", "/about", "/services", "/contact"] as const;

/** Bust Next.js route cache for public pages that read `site_content`. */
export function revalidateSiteContent(key: SiteContentKey) {
  if (key === "footer") {
    for (const path of MARKETING_PATHS) {
      revalidatePath(path);
    }
    revalidatePath("/", "layout");
    return;
  }

  const page = SITE_CONTENT_PAGES.find((entry) => entry.key === key);
  if (page) {
    revalidatePath(page.publicPath);
  }
}
