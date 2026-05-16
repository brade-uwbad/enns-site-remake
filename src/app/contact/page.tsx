import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Brad Enns.",
};

/**
 * Public `/contact` page. Composes the page-level layout (heading, intro,
 * and contact info) around the `ContactForm` component.
 *
 * @returns JSX for `/contact`.
 */
export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Get in Touch</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-zinc-600">
          Ready to buy, sell, or have questions about the market? Send a message or give me a call.
        </p>
      </header>

      <div className="mt-12">
        <ContactForm />
      </div>

      <section className="mt-16">
        <h2 className="text-center text-lg font-semibold tracking-tight text-zinc-900">
          Other ways to reach me
        </h2>

        <dl className="mx-auto mt-6 grid max-w-md grid-cols-[6rem_1fr] gap-x-6 gap-y-3 text-zinc-900">
          <dt className="font-semibold text-zinc-700">Mobile</dt>
          <dd>
            <a href="tel:5195001641" className="hover:text-zinc-600 hover:underline">
              (519) 500-1641
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Office</dt>
          <dd>
            <a href="tel:5198887778" className="hover:text-zinc-600 hover:underline">
              (519) 888-7778
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Fax</dt>
          <dd>(519) 954-7575</dd>

          <dt className="font-semibold text-zinc-700">Email</dt>
          <dd>
            <a href="mailto:brad@mres.ca" className="hover:text-zinc-600 hover:underline">
              brad@mres.ca
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Address</dt>
          <dd>
            <a
              href="https://maps.google.com/?q=368+Ash+Tree+Place+Waterloo+ON+N2T+1R7"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-600 hover:underline"
            >
              368 Ash Tree Place
              <br />
              Waterloo, ON N2T 1R7
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Socials</dt>
          <dd className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/ennsrealestate"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-600 hover:underline"
            >
              Facebook
            </a>
            <span aria-hidden="true" className="text-zinc-400">
              ·
            </span>

            <a
              href="https://ca.linkedin.com/pub/brad-enns/44/75b/5b9"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-600 hover:underline"
            >
              LinkedIn
            </a>
          </dd>
        </dl>
      </section>
    </div>
  );
}
