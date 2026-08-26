-- Site-wide feature settings (simple key/value flags toggled from the admin dashboard).
-- Safe to run repeatedly.

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

-- Public read so the live site can honour the flags. Writes go through the
-- service-role key (admin client), which bypasses RLS.
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

-- Show the "More listings nearby" section on listing detail pages by default.
insert into public.site_settings (key, value)
values ('show_nearby_listings', 'true'::jsonb)
on conflict (key) do nothing;
