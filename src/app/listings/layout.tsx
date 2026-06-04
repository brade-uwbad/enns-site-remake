import type { ReactNode } from "react";

/**
 * Listings section layout: same white canvas as the rest of the marketing site.
 */
export default function ListingsLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-white">{children}</div>;
}
