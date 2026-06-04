"use client";

import { useEffect, useState } from "react";

import type { DashboardLead } from "@/lib/admin/dashboard-data";
import { formatAdminDateTime } from "@/lib/format-admin-datetime";
import { parseLeadMessage } from "@/lib/contact/parse-lead-message";

const LEAD_CARD_CLASS =
  "flex h-[200px] w-full flex-col rounded-lg border border-slate-300 bg-white px-5 py-4 text-left shadow-sm transition hover:border-slate-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A6696] focus-visible:ring-offset-2";

type RecentLeadsSectionProps = {
  leads: DashboardLead[];
};

export function RecentLeadsSection({ leads }: RecentLeadsSectionProps) {
  const [activeLead, setActiveLead] = useState<DashboardLead | null>(null);

  useEffect(() => {
    if (!activeLead) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveLead(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeLead]);

  if (leads.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-slate-600">
        No inquiries yet. When someone submits the contact form on the site, their message will show
        up here.
      </p>
    );
  }

  const activeParsed = activeLead ? parseLeadMessage(activeLead.message) : null;

  return (
    <>
      <ul className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        {leads.map((lead) => {
          const { subject, body } = parseLeadMessage(lead.message);
          const preview = subject || body;

          return (
            <li key={lead.id}>
              <button
                type="button"
                onClick={() => setActiveLead(lead)}
                className={LEAD_CARD_CLASS}
                aria-haspopup="dialog"
              >
                <p className="shrink-0 font-semibold text-slate-900">{lead.name}</p>
                <p className="shrink-0 text-sm text-slate-600">{lead.email}</p>
                <p className="mt-2 line-clamp-2 min-h-[2.5rem] flex-1 text-sm leading-snug text-slate-600">
                  {subject ? (
                    <>
                      <span className="font-medium text-slate-700">Subject: </span>
                      {subject}
                    </>
                  ) : (
                    preview
                  )}
                </p>
                <div className="mt-auto flex shrink-0 items-center justify-between gap-2 pt-3">
                  <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-700">
                    {lead.source}
                  </span>
                  <span className="text-xs text-slate-500">{formatAdminDateTime(lead.created_at)}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {activeLead && activeParsed ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onClick={() => setActiveLead(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`lead-dialog-title-${activeLead.id}`}
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveLead(null)}
              className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-700"
              aria-label="Close lead"
            >
              ✕
            </button>
            <h3
              id={`lead-dialog-title-${activeLead.id}`}
              className="pr-8 text-lg font-bold text-slate-900"
            >
              {activeLead.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              <a href={`mailto:${activeLead.email}`} className="text-[#3A6696] hover:underline">
                {activeLead.email}
              </a>
            </p>
            {activeLead.phone ? (
              <p className="mt-1 text-sm text-slate-600">{activeLead.phone}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-sm bg-slate-100 px-2 py-0.5 font-medium uppercase tracking-wide text-slate-700">
                {activeLead.source}
              </span>
              <span>{formatAdminDateTime(activeLead.created_at)}</span>
            </div>
            {activeParsed.subject ? (
              <>
                <p className="mt-4 text-sm font-semibold text-slate-900">Subject</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{activeParsed.subject}</p>
              </>
            ) : null}
            <p className="mt-4 text-sm font-semibold text-slate-900">Message</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {activeParsed.body || activeLead.message}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
