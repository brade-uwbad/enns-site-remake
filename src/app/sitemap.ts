import type { MetadataRoute } from "next";
import { fetchListings } from "@/lib/listings/query";
import { absoluteUrl } from "@/lib/site-config";

/** Refresh the sitemap hourly so newly published/sold listings appear without a redeploy. */
export const revalidate = 3600;

/** `GET /sitemap.xml` — static marketing routes plus every public (active + sold) listing. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/listings"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/services"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
  ];

  let listingEntries: MetadataRoute.Sitemap = [];
  try {
    const [active, sold] = await Promise.all([
      fetchListings("active", { page: 1, limit: 1000 }),
      fetchListings("sold", { page: 1, limit: 1000 }),
    ]);
    listingEntries = [...active.items, ...sold.items].map((listing) => ({
      url: absoluteUrl(`/listings/${listing.id}`),
      lastModified: listing.updated_at ? new Date(listing.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: listing.status === "sold" ? 0.5 : 0.8,
    }));
  } catch {
    // If listings can't be loaded, still return the static routes rather than failing the sitemap.
    listingEntries = [];
  }

  return [...staticEntries, ...listingEntries];
}
