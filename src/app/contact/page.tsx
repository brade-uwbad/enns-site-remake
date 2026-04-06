import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Brad Enns.",
};

/**
 * Contact page placeholder until the form posts to `/api/contact`.
 *
 * @returns JSX for `/contact`.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Contact</h1>
      <p className="mt-6 leading-relaxed text-zinc-600 dark:text-zinc-400">
        A contact form will post to{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">/api/contact</code>{" "}
        once wired. For now this page is a placeholder for layout and copy.
      </p>
      <dl className="mt-10 space-y-4 text-sm">
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">Phone</dt>
          <dd className="text-zinc-600 dark:text-zinc-400">(519) 555-0100</dd>
        </div>
        <div>
          <dt className="font-medium text-zinc-900 dark:text-zinc-50">Email</dt>
          <dd className="text-zinc-600 dark:text-zinc-400">brad@example.com</dd>
        </div>
      </dl>
    </div>
  );
}
