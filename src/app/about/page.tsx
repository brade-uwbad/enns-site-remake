import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "About Brad Enns and real estate services in Kitchener–Waterloo.",
};

/**
 * Placeholder About page until final biography and media are added.
 *
 * @returns JSX for `/about`.
 */
export default function AboutPage() {
  return (


    <div className="min-h-screen bg-white">

      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">

        {/* MOBILE ONLY: eyebrow + heading */}
        <div className="md:hidden">
          <p className="text-brand-gold text-base font-medium mb-2">
            Kitchener, Waterloo Real Estate Agent
          </p>
          <h1 className="text-4xl font-bold text-slate-900 mb-5">
            Meet Brad Enns
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">

          {/* LEFT COLUMN */}
          <div className="w-full md:w-2/5 flex-shrink-0">



            {/* PHOTO + MOBILE STAT CARDS side by side */}
            <div className="flex gap-4 items-start">



              {/* PHOTO */}
              <div className="relative w-1/2 md:w-full aspect-[4/5] rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src="/images/brad-enns.jpg"
                  alt="Brad Enns, Enns Real Estate"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>



              {/* MOBILE ONLY: stat cards */}
              <div className="md:hidden flex flex-col gap-4 flex-1">
                <div className="bg-slate-100 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-brand-gold">20+</p>
                  <p className="text-sm text-slate-500 mt-1">homes sold</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-brand-gold">5+</p>
                  <p className="text-sm text-slate-500 mt-1">years of experience</p>
                </div>
              </div>

            </div>





            {/* CONTACT INFO */}
            <div className="flex items-center gap-6 text-sm text-slate-600 mt-5">
              <a href="tel:5195001641" className="flex items-center gap-2 hover:text-brand-gold transition-colors duration-200">
                <img src="/icons/Phone.svg" alt="" width={16} height={16} />
                519 - 500 - 1641
              </a>
              <a href="mailto:brad@mres.ca" className="flex items-center gap-2 hover:text-brand-gold transition-colors duration-200">
                <img src="/icons/Mail.svg" alt="" width={16} height={16} />
                brad@mres.ca
              </a>
            </div>


            {/* DESKTOP ONLY: Contact Brad Today button */}
            <a
              href="/contact"
              className="hidden md:block mt-4 text-center border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white font-semibold text-xs uppercase tracking-widest py-3.5 px-6 rounded transition-colors duration-200"
            >
              Contact Brad Today
            </a>
          </div>






          {/* RIGHT COLUMN */}
          <div className="w-full md:w-3/5">



            {/* DESKTOP ONLY: eyebrow + heading */}
            <div className="hidden md:block">
              <p className="text-brand-gold text-base font-medium mb-2">
                Kitchener, Waterloo Real Estate Agent
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-5">
                Meet Brad Enns
              </h1>
            </div>



            {/* BIO PARAGRAPH */}
            <p className="text-slate-600 leading-relaxed mb-6">
              Description descriptions Description descriptions descriptions descriptions descriptions descriptions descriptions descriptions descriptions descriptionsdescriptionsdescriptionsdescriptions.
            </p>



            {/* SUBHEADING + SECOND PARAGRAPH */}
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              Another heading / What I do
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details appraisal details 
            </p>


            {/* DESKTOP ONLY: stat cards */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              <div className="bg-slate-100 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-brand-gold">20+</p>
                <p className="text-sm text-slate-500 mt-1">homes sold</p>
              </div>
              <div className="bg-slate-100 rounded-xl p-6 text-center">
                <p className="text-4xl font-bold text-brand-gold">5+</p>
                <p className="text-sm text-slate-500 mt-1">years of experience</p>
              </div>
            </div>





            {/* MOBILE ONLY: Contact Brad Today button */}
            <a
              href="/contact"
              className="md:hidden mt-6 block text-center border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white font-semibold text-xs uppercase tracking-widest py-3.5 px-6 rounded transition-colors duration-200"
            >
              Contact Brad Today
            </a>
          </div>
        </div>
      </div>
    </div >
  );
}
