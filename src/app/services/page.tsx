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
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | Brad Enns",
    description: "Enns Real Estate services in Kitchener–Waterloo and surrounding communities.",
    url: "/services",
  },
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const { payload: c } = await fetchSiteContent("services");

  return (
    <div className={`min-h-screen bg-white ${poppins.className}`}>
      <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-10 sm:px-6 sm:pb-4 sm:pt-12">
        <h1 className="text-center text-3xl font-medium text-slate-900 sm:text-4xl md:text-5xl">
          {c.heroTitle}
        </h1>
        <p className="mt-4 text-center text-base font-normal leading-relaxed text-slate-600 sm:mt-6 sm:text-lg md:text-[20px]">
          {c.heroDescription}
        </p>
      </div>

      {c.services.length > 0 ? (
        <section className="pb-14 pt-8 sm:pb-16 sm:pt-10" aria-label="Service offerings">
          {/* Flex-wrap keeps cards centred for any count, up to 4 per row, then
              wraps to a new row. */}
          <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-center gap-8 px-4 sm:px-6">
            {c.services.map((service, index) => (
              <article
                key={index}
                className="flex min-h-0 w-full max-w-sm flex-col items-center rounded-xl bg-white px-6 py-10 text-center shadow-[0_4px_14px_rgba(15,23,42,0.08)] sm:min-h-[380px] sm:w-[calc(50%-1rem)] sm:px-8 sm:pb-12 sm:pt-10 md:min-h-[460px] md:px-10 md:pb-14 md:pt-12 lg:w-[calc(25%-1.5rem)]"
              >
                {service.iconUrl ? (
                  <div className="relative mb-8 h-[96px] w-[112px] shrink-0">
                    <Image
                      src={service.iconUrl}
                      alt=""
                      fill
                      sizes="112px"
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                ) : null}
                <h2 className="text-[1.5rem] font-medium leading-snug text-slate-900">
                  {service.title}
                </h2>
                <p className="mt-4 max-w-[18rem] flex-1 text-base font-normal leading-relaxed text-slate-600">
                  {service.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
