import type { Metadata } from "next";
import Image from "next/image";
import { Montserrat, Poppins } from "next/font/google";

import { fetchSiteContent } from "@/lib/content/query";

const poppins = Poppins({
  weight: ["400", "500"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  weight: "400",
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
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-12 sm:px-6 sm:pb-4 md:hidden">
        <h1 className="text-center text-4xl font-medium text-slate-900 dark:text-zinc-50">
          {c.heroTitle}
        </h1>
        <p
          className={`${poppins.className} mt-6 text-center text-[20px] font-normal leading-normal text-[#7b7b7b]`}
        >
          {c.heroDescription}
        </p>
      </div>

      <div className="mx-auto hidden w-full max-w-3xl px-4 pb-3 pt-12 sm:px-6 sm:pb-4 md:block">
        <h1 className="text-center text-4xl font-medium text-slate-900 dark:text-zinc-50 md:text-5xl">
          {c.heroTitle}
        </h1>
        <p
          className={`${poppins.className} mt-6 text-center text-[20px] font-normal leading-normal text-[#7b7b7b]`}
        >
          {c.heroDescription}
        </p>
      </div>

      <section
        className="bg-white pb-10 pt-5 dark:bg-zinc-950 sm:pb-14 sm:pt-6"
        aria-label="Service offerings"
      >
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-3 md:gap-8">
          {serviceCards.map(({ title, iconSrc, iconWidth, iconHeight, body }) => (
            <article
              key={title}
              className="flex flex-col items-center rounded-xl bg-zinc-50 px-6 pb-8 pt-8 text-center shadow-md ring-1 ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700/80"
            >
              <div className="relative mb-6 h-[96px] w-[112px] shrink-0">
                <Image
                  src={iconSrc}
                  alt=""
                  width={iconWidth}
                  height={iconHeight}
                  className="h-full w-full object-contain"
                />
              </div>
              <h2
                className={`${poppins.className} text-[1.5rem] font-medium leading-snug text-slate-900 dark:text-zinc-50`}
              >
                {title}
              </h2>
              <p
                className={`${montserrat.className} mt-3 text-base font-normal leading-relaxed text-zinc-600 dark:text-zinc-400`}
              >
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
