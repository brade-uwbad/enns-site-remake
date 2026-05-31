import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";

import type { HomepageContent } from "@/lib/content/types";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const HERO_IMAGE = "/images/homepage_background_temp.jpg";

type HomeHeroProps = Pick<
  HomepageContent,
  "heroEyebrow" | "heroTitle" | "heroDescription" | "heroCtaLabel"
>;

export function HomeHero({ heroEyebrow, heroTitle, heroDescription, heroCtaLabel }: HomeHeroProps) {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/45" aria-hidden />

      <div
        className={`absolute bottom-0 left-0 z-10 pb-12 pl-5 sm:pb-16 sm:pl-8 md:pb-20 md:pl-10 lg:pl-14 ${poppins.className}`}
      >
        <div className="max-w-xl text-white">
          <p className="text-base font-normal sm:text-lg">{heroEyebrow}</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-[3.25rem]">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/95 sm:text-base">
            {heroDescription}
          </p>
          <Link
            href="/about"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-[#4a6d95] px-8 py-3 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-[#3f5f84] sm:text-sm"
          >
            {heroCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
