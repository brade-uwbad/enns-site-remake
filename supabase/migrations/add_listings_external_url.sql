-- Optional external link for a listing (e.g. MLS, Realtor.ca, virtual tour).
alter table public.listings
  add column if not exists external_url text;
