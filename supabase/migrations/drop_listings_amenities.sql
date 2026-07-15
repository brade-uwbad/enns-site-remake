-- Amenities were removed from the product. Drop the column from listings.
-- Safe to run once the app no longer reads/writes amenities (this deploy).
-- Idempotent.

alter table public.listings drop column if exists amenities;
