import type { Metadata } from "next";
import Image from "next/image";

import { fetchSiteContent } from "@/lib/content/query";

export const metadata: Metadata = {
  title: "About",
  description: "About Brad Enns and real estate services in Kitchener–Waterloo.",
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export default async function AboutPage() {
  const { payload: c } = await fetchSiteContent("about");
  const phoneHref = `tel:${digitsOnly(c.phone)}`;
  const emailHref = `mailto:${c.email}`;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <div className="md:hidden">
          <p className="mb-2 text-base font-medium text-brand-gold">{c.eyebrow}</p>
          <h1 className="mb-5 text-4xl font-medium text-slate-900">{c.headline}</h1>
        </div>

        <div className="flex flex-col items-start gap-12 md:flex-row md:gap-16">
          <div className="w-full shrink-0 md:w-2/5">
            <div className="flex items-start gap-4">
              <div className="relative aspect-[4/5] w-1/2 shrink-0 overflow-hidden rounded-xl md:w-full">
                <Image
                  src="/images/brad-enns.jpg"
                  alt="Brad Enns, Enns Real Estate"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              <div className="flex flex-1 flex-col gap-4 md:hidden">
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

            <div className="mt-5 flex items-center gap-6 text-sm text-slate-600">
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
              className="mt-4 hidden rounded border border-brand-gold px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-brand-gold transition-colors duration-200 hover:bg-brand-gold hover:text-white md:block"
            >
              {c.ctaLabel}
            </a>
          </div>

          <div className="w-full md:w-3/5">
            <div className="hidden md:block">
              <p className="mb-2 text-base font-medium text-brand-gold">{c.eyebrow}</p>
              <h1 className="mb-5 text-4xl font-medium text-slate-900 md:text-5xl">{c.headline}</h1>
            </div>

            <p className="mb-6 leading-relaxed text-slate-600">{c.bio}</p>

            <h2 className="mb-3 text-lg font-bold text-slate-900">{c.subheading}</h2>
            <p className="mb-8 leading-relaxed text-slate-600">{c.subBio}</p>

            <div className="hidden grid-cols-2 gap-4 md:grid">
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
    </div>
  );
}

