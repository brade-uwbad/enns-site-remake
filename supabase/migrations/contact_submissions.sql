-- Contact form leads for the admin dashboard (safe to re-run).
-- Inserts/reads use the Supabase service role from the Next.js app; no anon policies.

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  source text not null default 'contact' check (source in ('contact', 'valuation')),
  created_at timestamptz not null default now()
);

comment on table public.contact_submissions is
  'Contact and valuation form submissions; written by the app with the service role key.';

alter table public.contact_submissions enable row level security;

-- Intentionally no RLS policies: public anon cannot read or write.
-- The API uses STORAGE_SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY.
