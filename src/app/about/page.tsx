import type { Metadata } from "next";

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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        About
      </h1>
      <p className="mt-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
        This page will hold Brad’s story, experience, and areas served. For now it is a placeholder
        so navigation and layout can be reviewed before final content and photos are added.
      </p>
    </div>
  );
}
