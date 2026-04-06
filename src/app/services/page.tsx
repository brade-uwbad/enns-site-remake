import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Buying, selling, and home appraisal support in KW and surrounding communities.",
};

/**
 * Services overview: buying, selling, appraisal sections (placeholder copy).
 *
 * @returns JSX for `/services`.
 */
export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Services</h1>
      <ul className="mt-8 space-y-6 text-zinc-600 dark:text-zinc-400">
        <li>
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Buying a home</h2>
          <p className="mt-2 leading-relaxed">
            Placeholder: search support, offers, conditions, and closing coordination.
          </p>
        </li>
        <li>
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Selling your home</h2>
          <p className="mt-2 leading-relaxed">
            Placeholder: pricing, marketing, showings, and negotiation.
          </p>
        </li>
        <li>
          <h2 className="font-medium text-zinc-900 dark:text-zinc-50">Home appraisal</h2>
          <p className="mt-2 leading-relaxed">
            Placeholder: what drives value and how to interpret appraisal results.
          </p>
        </li>
      </ul>
    </div>
  );
}
