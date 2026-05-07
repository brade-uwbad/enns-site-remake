-- Adds a property_type column for categorizing listings (apartment, detached, townhouse, condo, other).
alter table public.listings
  add column if not exists property_type text;

alter table public.listings
  drop constraint if exists listings_property_type_check;

alter table public.listings
  add constraint listings_property_type_check
  check (property_type is null or property_type in ('apartment','detached','townhouse','condo','other'));
