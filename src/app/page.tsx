import Link from "next/link";

/**
 * Marketing landing route (`/`): hero, value props, and calls to action.
 *
 * @returns JSX for the home page (no async data yet).
 */
export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-4 py-20 sm:px-6 dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Kitchener–Waterloo & Elmira area
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Local guidance for buying and selling your next home
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Clear communication, steady support, and a practical plan from first conversation to
            keys. Browse listings or reach out for a conversation.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              View listings
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Contact Brad
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">How I can help</h2>
        <ul className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Buying",
              text: "Strategy for homes that fit your budget, neighbourhood, and timeline.",
            },
            {
              title: "Selling",
              text: "Pricing context, presentation, and negotiation with less guesswork.",
            },
            {
              title: "Appraisals",
              text: "Context on value and what to expect when numbers land on paper.",
            },
          ].map((item) => (
            <li key={item.title}>
              <h3 className="font-medium text-zinc-900 dark:text-zinc-50">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-500">
          Placeholder copy. Replace with Brad’s voice, neighbourhoods, and credentials.
        </p>
      </section>
    </>
  );
}
