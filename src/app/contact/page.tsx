import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { fetchSiteContent } from "@/lib/content/query";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Brad Enns.",
};

export const dynamic = "force-dynamic";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export default async function ContactPage() {
  const { payload: c } = await fetchSiteContent("contact");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{c.title}</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-zinc-600">{c.intro}</p>
      </header>

      <div className="mt-12">
        <ContactForm />
      </div>

      <section className="mt-16">
        <h2 className="text-center text-lg font-semibold tracking-tight text-zinc-900">
          {c.sectionTitle}
        </h2>

        <dl className="mx-auto mt-6 w-fit space-y-4 text-left text-zinc-900 sm:grid sm:grid-cols-[auto_auto] sm:gap-x-10 sm:gap-y-3 sm:space-y-0">
          <dt className="font-semibold text-zinc-700">Mobile</dt>
          <dd className="sm:text-right">
            <a
              href={`tel:${digitsOnly(c.mobile)}`}
              className="hover:text-zinc-600 hover:underline"
            >
              {c.mobile}
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Office</dt>
          <dd className="sm:text-right">
            <a
              href={`tel:${digitsOnly(c.office)}`}
              className="hover:text-zinc-600 hover:underline"
            >
              {c.office}
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Fax</dt>
          <dd className="sm:text-right">{c.fax}</dd>

          <dt className="font-semibold text-zinc-700">Email</dt>
          <dd className="sm:text-right">
            <a href={`mailto:${c.email}`} className="hover:text-zinc-600 hover:underline">
              {c.email}
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Address</dt>
          <dd className="sm:text-right">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${c.addressLine1} ${c.addressLine2}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-600 hover:underline"
            >
              {c.addressLine1}
              <br />
              {c.addressLine2}
            </a>
          </dd>

          <dt className="font-semibold text-zinc-700">Socials</dt>
          <dd className="flex items-center gap-3 sm:justify-end">
            <a
              href={c.facebookUrl}
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
              href={c.linkedinUrl}
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
