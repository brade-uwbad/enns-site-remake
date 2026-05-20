import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

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
  title: {
    default: "Brad Enns | Kitchener–Waterloo Real Estate",
    template: "%s | Brad Enns",
  },
  description:
    "Real estate services for buying, selling, and appraisals in Kitchener–Waterloo and surrounding communities.",
};

/**
 * Root layout for all marketing pages: global fonts, site chrome, and main content region.
 *
 * @param children - Page segment content (e.g. home, about).
 * @returns HTML document shell with header and `<main>`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
