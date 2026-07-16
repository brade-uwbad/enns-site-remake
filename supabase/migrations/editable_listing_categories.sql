-- Listing categories are now admin-editable (stored in site_settings), and
-- apartment + condo are merged into a new "leases" category.
-- Run after this code is deployed. Idempotent.

-- 1. Allow arbitrary category slugs (categories are managed in the admin now).
alter table public.listings
  drop constraint if exists listings_property_type_check;

-- 2. Merge existing apartment/condo listings into "leases".
update public.listings
  set property_type = 'leases'
  where property_type in ('apartment', 'condo');

-- 3. Seed the default categories (Leases, Detached, Townhouse). The app falls
--    back to these defaults if the row is absent, and the admin editor
--    overwrites this row on save.
insert into public.site_settings (key, value)
values (
  'listing_categories',
  '[
    {"value":"leases","label":"Leases","iconGrey":"/icons/house_grey.png","iconBlue":"/icons/house_blue.png"},
    {"value":"detached","label":"Detached","iconGrey":"/icons/detached_grey.png","iconBlue":"/icons/detached_blue.png"},
    {"value":"townhouse","label":"Townhouse","iconGrey":"/icons/townhouse_grey.png","iconBlue":"/icons/townhouse_blue.png"}
  ]'::jsonb
)
on conflict (key) do nothing;
