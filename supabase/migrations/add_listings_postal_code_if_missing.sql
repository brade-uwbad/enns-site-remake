-- Ensure listings has postal_code for non-geocode proximity fallback.
alter table public.listings
  add column if not exists postal_code text;

create index if not exists listings_postal_code_idx on public.listings (lower(postal_code));
