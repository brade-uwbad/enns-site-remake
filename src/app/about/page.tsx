import type { Metadata } from "next";
import Image from "next/image";

import { ClientReviewsSection } from "@/components/reviews/client-reviews-section";
import { fetchSiteContent } from "@/lib/content/query";
import { fetchFeaturedReviews } from "@/lib/reviews/query";

export const metadata: Metadata = {
  title: "About",
  description: "About Brad Enns and real estate services in Kitchener–Waterloo.",
};

export const dynamic = "force-dynamic";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export default async function AboutPage() {
  const [{ payload: c }, featuredReviews] = await Promise.all([
    fetchSiteContent("about"),
    fetchFeaturedReviews(),
  ]);
  const phoneHref = `tel:${digitsOnly(c.phone)}`;
  const emailHref = `mailto:${c.email}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-8">
        <div className="md:hidden">
          <p className="mb-2 text-base font-medium text-brand-gold">{c.eyebrow}</p>
          <h1 className="mb-5 text-3xl font-medium text-slate-900 sm:text-4xl">{c.headline}</h1>
        </div>

        <div className="flex flex-col items-start gap-10 md:flex-row md:items-stretch md:gap-14">
          <div className="flex w-full shrink-0 flex-col md:w-2/5">
            <div className="flex items-start gap-4 md:hidden">
              <div className="relative aspect-square w-1/2 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src="/images/brad-enns.jpg"
                  alt="Brad Enns, Enns Real Estate"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              <div className="flex flex-1 flex-col gap-4">
                <div className="rounded-xl bg-slate-100 p-4 text-center">
                  <p className="text-3xl font-bold text-brand-gold">{c.stat1Value}</p>
                  <p className="mt-1 text-sm text-slate-500">{c.stat1Label}</p>
                </div>
                <div className="rounded-xl bg-slate-100 p-4 text-center">
                  <p className="text-3xl font-bold text-brand-gold">{c.stat2Value}</p>
                  <p className="mt-1 text-sm text-slate-500">{c.stat2Label}</p>
                </div>
              </div>
            </div>

            <div className="relative hidden aspect-square w-full overflow-hidden rounded-xl md:block">
              <Image
                src="/images/brad-enns.jpg"
                alt="Brad Enns, Enns Real Estate"
                fill
                className="object-cover object-top"
                priority
              />
            </div>

            <div className="mt-5 flex w-full flex-col md:mt-auto">
              <div className="flex w-full flex-row flex-wrap items-center justify-center gap-6 pt-2 text-sm text-slate-600 sm:gap-8">
                <a
                  href={phoneHref}
                  className="flex items-center gap-2 transition-colors duration-200 hover:text-brand-gold"
                >
                  <Image src="/icons/Phone.svg" alt="" width={16} height={16} /> {c.phone}
                </a>
                <a
                  href={emailHref}
                  className="flex items-center gap-2 transition-colors duration-200 hover:text-brand-gold"
                >
                  <Image src="/icons/Mail.svg" alt="" width={16} height={16} /> {c.email}
                </a>
              </div>

              <a
                href="/contact"
                className="mt-4 hidden w-full rounded border border-brand-gold px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-brand-gold transition-colors duration-200 hover:bg-brand-gold hover:text-white md:block"
              >
                {c.ctaLabel}
              </a>
            </div>
          </div>

          <div className="flex w-full flex-col md:w-3/5">
            <div className="hidden md:block">
              <p className="mb-2 text-base font-medium text-brand-gold">{c.eyebrow}</p>
              <h1 className="mb-5 text-4xl font-medium text-slate-900 md:text-5xl">{c.headline}</h1>
            </div>

            <p className="mb-6 leading-relaxed text-slate-600">{c.bio}</p>

            <h2 className="mb-3 text-lg font-bold text-slate-900">{c.subheading}</h2>
            <p className="mb-8 leading-relaxed text-slate-600">{c.subBio}</p>

            <div className="mt-auto hidden grid-cols-2 gap-4 md:grid">
              <div className="rounded-xl bg-slate-100 p-6 text-center">
                <p className="text-4xl font-bold text-brand-gold">{c.stat1Value}</p>
                <p className="mt-1 text-sm text-slate-500">{c.stat1Label}</p>
              </div>
              <div className="rounded-xl bg-slate-100 p-6 text-center">
                <p className="text-4xl font-bold text-brand-gold">{c.stat2Value}</p>
                <p className="mt-1 text-sm text-slate-500">{c.stat2Label}</p>
              </div>
            </div>

            <a
              href="/contact"
              className="mt-6 block rounded border border-brand-gold px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-brand-gold transition-colors duration-200 hover:bg-brand-gold hover:text-white md:hidden"
            >
              {c.ctaLabel}
            </a>
          </div>
        </div>
      </div>

      <ClientReviewsSection reviews={featuredReviews} />
    </div>
  );
}

