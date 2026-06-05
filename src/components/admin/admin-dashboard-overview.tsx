import Link from "next/link";

import { RecentLeadsSection } from "@/components/admin/recent-leads-section";
import type { DashboardLead, ListingStatusCounts } from "@/lib/admin/dashboard-data";
import { Button } from "@/components/ui/button";

type AdminDashboardOverviewProps = {
  counts: ListingStatusCounts;
  leads: DashboardLead[];
};

const MENU_CARD_CLASS =
  "block w-full rounded-lg border border-slate-300 bg-white p-5 text-left transition hover:border-slate-400";

const PANEL_CLASS = "rounded-lg border border-slate-300 bg-white";

const STATUS_CARDS: {
  key: keyof Pick<ListingStatusCounts, "active" | "sold">;
  label: string;
  hint: string;
  accent: string;
}[] = [
  {
    key: "active",
    label: "Active",
    hint: "Live on the site",
    accent: "border-[#3A6696] bg-[#eef4fa] text-[#3A6696]",
  },
  {
    key: "sold",
    label: "Sold",
    hint: "Marked sold",
    accent: "border-slate-300 bg-white text-slate-700",
  },
];

const QUICK_LINKS: { href: string; title: string; description: string }[] = [
  {
    href: "/admin/content",
    title: "Edit site content",
    description: "Update hero text, calls to action, and copy on marketing pages.",
  },
  {
    href: "/admin/reviews",
    title: "Client reviews",
    description: "Add testimonials and choose which appear on the About page.",
  },
];

export function AdminDashboardOverview({ counts, leads }: AdminDashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-slate-900">Listing overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {STATUS_CARDS.map(({ key, label, hint, accent }) => (
            <div key={key} className={`rounded-lg border px-5 py-4 ${accent}`}>
              <p className="text-sm font-medium opacity-90">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{counts[key]}</p>
              <p className="mt-1 text-xs opacity-80">{hint}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">
          {counts.total} listing{counts.total === 1 ? "" : "s"} total. Manage listings from the{" "}
          <Link
            href="/admin/listings"
            className="font-medium text-[#3A6696] underline-offset-2 hover:underline"
          >
            Listings
          </Link>{" "}
          page in the nav.
        </p>
        <div className="mt-4 flex w-full gap-2 sm:gap-3">
          <Button variant="outline" className="h-11 min-h-11 flex-1 basis-0 px-2 text-center text-sm" asChild>
            <Link href="/listings">View public listings</Link>
          </Button>
          <Button className="h-11 min-h-11 flex-1 basis-0 px-2 text-center text-sm" asChild>
            <Link href="/admin/listings">Manage listings</Link>
          </Button>
          <Button variant="outline" className="h-11 min-h-11 flex-1 basis-0 px-2 text-center text-sm" asChild>
            <Link href="/admin/content">Edit site content</Link>
          </Button>
        </div>
      </section>

      <ul className="space-y-5">
        {QUICK_LINKS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={MENU_CARD_CLASS}>
              <p className="text-base font-semibold text-slate-900">{item.title}</p>
              <div className="mt-3 rounded-md bg-slate-100 px-4 py-3">
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section className={PANEL_CLASS}>
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent leads</h2>
        </div>
        <RecentLeadsSection leads={leads} />
      </section>
    </div>
  );
}
