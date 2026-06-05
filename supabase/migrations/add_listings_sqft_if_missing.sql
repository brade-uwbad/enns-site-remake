-- Square footage column used by the listing editor and public listing cards.
alter table public.listings
  add column if not exists sqft integer;

comment on column public.listings.sqft is 'Interior square footage (optional).';
