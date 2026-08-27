import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import { SiteFooter } from "@/components/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import {
  AGENT_NAME,
  AREAS_SERVED,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/site-config";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/** Sans body font via `next/font`; exposes `--font-geist-sans` on the document root. */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/** Monospace font for code or UI accents; exposes `--font-geist-mono`. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Default document metadata; nested routes can export their own `metadata` objects. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Brad Enns | Kitchener–Waterloo Real Estate",
    template: "%s | Brad Enns",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Brad Enns | Kitchener–Waterloo Real Estate",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brad Enns | Kitchener–Waterloo Real Estate",
    description: SITE_DESCRIPTION,
  },
};

/**
 * Site-wide organization/agent structured data. Nested pages add more specific
 * types (e.g. `RealEstateListing`, `Review`) that reference this same `@id`.
 */
const agentJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "@id": absoluteUrl("/#agent"),
  name: AGENT_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  areaServed: AREAS_SERVED.map((name) => ({
    "@type": "City",
    name,
  })),
  knowsAbout: ["Residential real estate", "Home buying", "Home selling", "Property appraisals"],
  address: {
    "@type": "PostalAddress",
    addressRegion: "ON",
    addressCountry: "CA",
  },
};

/**
 * Root layout for all marketing pages: global fonts, site chrome, and main content region.
 *
 * @param children - Page segment content (e.g. home, about).
 * @returns HTML document shell with header and `<main>`.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={agentJsonLd} />
        <SiteChrome footer={<SiteFooter />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
