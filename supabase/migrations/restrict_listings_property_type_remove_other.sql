-- Tightens the property_type check constraint to drop the 'other' option.
-- Any existing rows storing 'other' are reset to null first so the new constraint can be created.
update public.listings
  set property_type = null
  where property_type = 'other';

alter table public.listings
  drop constraint if exists listings_property_type_check;

alter table public.listings
  add constraint listings_property_type_check
  check (property_type is null or property_type in ('apartment','detached','townhouse','condo'));
