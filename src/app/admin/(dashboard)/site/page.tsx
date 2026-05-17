import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site content",
  description: "Edit site copy and sections.",
};

export default function AdminSiteContentPage() {
  return (
    <div className="bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl space-y-4 px-4 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Site content</h1>
        <p className="text-sm text-zinc-600">
          This is a placeholder for page-level editing (home, about, services, and so on). Next step is to
          store editable fields in Supabase or markdown in the repo, then wire forms here behind the same admin
          login.
        </p>
      </div>
    </div>
  );
}
