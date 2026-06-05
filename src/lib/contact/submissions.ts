import { addContactSubmission, listRecentContactSubmissions } from "@/lib/store/memory";
import type { ContactSubmissionRow } from "@/lib/store/types";
import { getSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export type ContactSubmissionInput = {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source?: "contact" | "valuation";
};

export async function saveContactSubmission(input: ContactSubmissionInput): Promise<void> {
  const row: Omit<ContactSubmissionRow, "id" | "created_at"> = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    message: input.message,
    source: input.source ?? "contact",
  };

  if (hasSupabaseAdminConfig()) {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("contact_submissions").insert({
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      source: row.source,
    });

    if (error) {
      console.error("Failed to save contact submission:", error.message);
      throw new Error(error.message);
    }
    return;
  }

  addContactSubmission(row);
}

export async function fetchRecentContactSubmissions(limit = 8): Promise<ContactSubmissionRow[]> {
  if (hasSupabaseAdminConfig()) {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("id,name,email,phone,message,source,created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to load contact submissions:", error.message);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone ?? null,
      message: row.message,
      source: row.source as ContactSubmissionRow["source"],
      created_at: row.created_at,
    }));
  }

  return listRecentContactSubmissions(limit);
}
