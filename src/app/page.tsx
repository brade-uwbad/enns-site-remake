import { HomeHero } from "@/components/home/home-hero";
import { fetchSiteContent } from "@/lib/content/query";

export default async function HomePage() {
  const { payload } = await fetchSiteContent("homepage");

  return (
    <HomeHero
      heroEyebrow={payload.heroEyebrow}
      heroTitle={payload.heroTitle}
      heroDescription={payload.heroDescription}
      heroCtaLabel={payload.heroCtaLabel}
    />
  );
}
