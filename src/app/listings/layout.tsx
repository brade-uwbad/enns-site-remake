import type { ReactNode } from "react";

/**
 * Listings section layout: light canvas behind header while keeping global chrome.
 */
export default function ListingsLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-slate-50">{children}</div>;
}
