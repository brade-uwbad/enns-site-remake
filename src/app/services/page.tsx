import type { Metadata } from "next";
import Image from "next/image";
import { Poppins } from "next/font/google";

import { fetchSiteContent } from "@/lib/content/query";

const poppins = Poppins({
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Services",
  description: "Enns Real Estate services in Kitchener–Waterloo and surrounding communities.",
};

export default async function ServicesPage() {
  const { payload: c } = await fetchSiteContent("services");

  const serviceCards = [
    {
      title: c.appraisalTitle,
      iconSrc: "/icons/appraisal.svg",
      iconWidth: 116,
      iconHeight: 99,
      body: c.appraisalBody,
    },
    {
      title: c.buyingTitle,
      iconSrc: "/icons/buying.svg",
      iconWidth: 111,
      iconHeight: 99,
      body: c.buyingBody,
    },
    {
      title: c.sellingTitle,
      iconSrc: "/icons/selling.svg",
      iconWidth: 95,
      iconHeight: 90,
      body: c.sellingBody,
    },
  ] as const;

  return (
    <div className={`min-h-screen bg-white ${poppins.className}`}>
      <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-10 sm:px-6 sm:pb-4 sm:pt-12">
        <h1 className="text-center text-3xl font-medium text-slate-900 sm:text-4xl md:text-5xl">{c.heroTitle}</h1>
        <p className="mt-4 text-center text-base font-normal leading-relaxed text-slate-600 sm:mt-6 sm:text-lg md:text-[20px]">
          {c.heroDescription}
        </p>
      </div>

      <section className="pb-14 pt-8 sm:pb-16 sm:pt-10" aria-label="Service offerings">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 md:gap-10">
          {serviceCards.map(({ title, iconSrc, iconWidth, iconHeight, body }) => (
            <article
              key={title}
              className="flex min-h-0 flex-col items-center rounded-xl bg-white px-6 py-10 text-center shadow-[0_4px_14px_rgba(15,23,42,0.08)] sm:min-h-[380px] sm:px-8 sm:pb-12 sm:pt-10 md:min-h-[460px] md:px-10 md:pb-14 md:pt-12"
            >
              <div className="relative mb-8 h-[96px] w-[112px] shrink-0">
                <Image
                  src={iconSrc}
                  alt=""
                  width={iconWidth}
                  height={iconHeight}
                  className="h-full w-full object-contain"
                />
              </div>
              <h2 className="text-[1.5rem] font-medium leading-snug text-slate-900">{title}</h2>
              <p className="mt-4 max-w-[18rem] flex-1 text-base font-normal leading-relaxed text-slate-600">
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
