import Link from "next/link";

import type { DashboardLead, ListingStatusCounts } from "@/lib/admin/dashboard-data";

type AdminDashboardOverviewProps = {
  counts: ListingStatusCounts;
  leads: DashboardLead[];
};

function formatLeadDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

const STATUS_CARDS: {
  key: keyof Pick<ListingStatusCounts, "active" | "sold">;
  label: string;
  hint: string;
  accent: string;
}[] = [
  { key: "active", label: "Active", hint: "Live on the site", accent: "border-sky-200 bg-sky-50 text-sky-900" },
  { key: "sold", label: "Sold", hint: "Marked sold", accent: "border-zinc-200 bg-zinc-50 text-zinc-900" },
];

export function AdminDashboardOverview({ counts, leads }: AdminDashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-zinc-900">Listing overview</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {STATUS_CARDS.map(({ key, label, hint, accent }) => (
            <div
              key={key}
              className={`rounded-xl border px-5 py-4 shadow-sm ${accent}`}
            >
              <p className="text-sm font-medium opacity-80">{label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{counts[key]}</p>
              <p className="mt-1 text-xs opacity-70">{hint}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          {counts.total} listing{counts.total === 1 ? "" : "s"} total.{" "}
          <Link href="/listings" className="font-medium text-[#4a6d95] hover:underline">
            View public listings
          </Link>
          {" · "}
          <Link href="/admin/listings" className="font-medium text-[#4a6d95] hover:underline">
            Manage listings
          </Link>
          {" · "}
          <Link href="/admin/content" className="font-medium text-[#4a6d95] hover:underline">
            Edit site content
          </Link>
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent leads</h2>
        </div>
        {leads.length === 0 ? (
          <p className="px-5 py-8 text-sm text-zinc-500">
            No inquiries yet. When someone submits the contact form on the site, their message will show up
            here.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {leads.map((lead) => (
              <li key={lead.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-zinc-900">{lead.name}</p>
                  <p className="text-sm text-zinc-600">{lead.email}</p>
                  <p className="line-clamp-2 text-sm text-zinc-500">{lead.message}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-zinc-500">
                  <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 font-medium uppercase tracking-wide text-zinc-700">
                    {lead.source}
                  </span>
                  <p className="mt-2">{formatLeadDate(lead.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
