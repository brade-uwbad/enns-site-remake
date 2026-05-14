import type { Metadata } from "next";
import Image from "next/image";
import { Montserrat, Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "500"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  weight: "400",
  subsets: ["latin"],
});

const placeholderBody =
  "Appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details.";

const serviceCards = [
  {
    title: "Home Appraisal",
    iconSrc: "/icons/appraisal.svg",
    iconWidth: 116,
    iconHeight: 99,
    body: placeholderBody,
  },
  {
    title: "Buying",
    iconSrc: "/icons/buying.svg",
    iconWidth: 111,
    iconHeight: 99,
    body: placeholderBody,
  },
  {
    title: "Selling",
    iconSrc: "/icons/selling.svg",
    iconWidth: 95,
    iconHeight: 90,
    body: placeholderBody,
  },
] as const;

export const metadata: Metadata = {
  title: "Services",
  description: "Enns Real Estate services in Kitchener–Waterloo and surrounding communities.",
};

/**
 * Services overview: hero copy and three service cards (appraisal, buying, selling).
 *
 * @returns JSX for `/services`.
 */
export default function ServicesPage() {
  return (
    <div className="w-full">
      {/* MOBILE ONLY: hero */}
      <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-12 sm:px-6 sm:pb-4 md:hidden">
        <h1 className="text-center text-4xl font-medium text-slate-900 dark:text-zinc-50">
          Enns Real Estate Services
        </h1>
        <p
          className={`${poppins.className} mt-6 text-center text-[20px] font-normal leading-normal text-[#7b7b7b]`}
        >
          We’re here to help you value, buy, and sell your home.
        </p>
      </div>

      {/* DESKTOP ONLY: hero */}
      <div className="mx-auto hidden w-full max-w-3xl px-4 pb-3 pt-12 sm:px-6 sm:pb-4 md:block">
        <h1 className="text-center text-4xl font-medium text-slate-900 dark:text-zinc-50 md:text-5xl">
          Enns Real Estate Services
        </h1>
        <p
          className={`${poppins.className} mt-6 text-center text-[20px] font-normal leading-normal text-[#7b7b7b]`}
        >
          We’re here to help you value, buy, and sell your home.
        </p>
      </div>

      {/* Service cards (single column on mobile, three columns from md) */}
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
