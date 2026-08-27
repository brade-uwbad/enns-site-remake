import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-config";

/** `GET /robots.txt` — allow crawling of public pages, block admin and API surfaces. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
