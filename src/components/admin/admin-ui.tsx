import { Poppins } from "next/font/google";
import type { ReactNode } from "react";

export const adminPoppins = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const adminCardClass =
  "rounded-lg border border-slate-300 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.06)]";

export const adminLinkClass = "font-medium text-[#3A6696] underline-offset-2 hover:underline";

export const adminPrimaryButtonClass =
  "inline-flex items-center justify-center rounded-md bg-[#3A6696] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#32587f] disabled:cursor-not-allowed disabled:opacity-60";

export const adminSecondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#140000] transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export const adminInputClass =
  "w-full rounded-sm border border-zinc-300 bg-white p-2 text-sm text-[#140000] placeholder:text-slate-500";

export const adminTextareaClass = `${adminInputClass} min-h-24 resize-y`;

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  breadcrumb?: ReactNode;
};

export function AdminPageHeader({ title, description, breadcrumb }: AdminPageHeaderProps) {
  return (
    <header className="mb-8">
      {breadcrumb ? <div className="mb-2 text-sm text-slate-600">{breadcrumb}</div> : null}
      <h1 className="text-2xl font-semibold tracking-tight text-[#140000] sm:text-3xl md:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p> : null}
    </header>
  );
}

/** Site-wide admin background + Poppins (wrap dashboard routes in layout). */
export function AdminDashboardLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className={`min-h-[calc(100dvh-var(--site-header-offset))] bg-white py-6 text-[#140000] sm:py-10 ${adminPoppins.className}`}
    >
      {children}
    </div>
  );
}

type AdminChromeProps = {
  children: ReactNode;
  maxWidth?: "2xl" | "3xl" | "5xl";
};

export function AdminChrome({ children, maxWidth = "5xl" }: AdminChromeProps) {
  const maxW =
    maxWidth === "2xl" ? "max-w-2xl" : maxWidth === "3xl" ? "max-w-3xl" : "max-w-5xl";

  return (
    <div className={`mx-auto ${maxW} px-4 sm:px-6`}>{children}</div>
  );
}
