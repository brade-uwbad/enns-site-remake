-- Add optional coordinates for true distance-based nearby listings.
alter table public.listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- Guard against invalid values when coordinates are set.
alter table public.listings
  drop constraint if exists listings_latitude_range_chk;
alter table public.listings
  add constraint listings_latitude_range_chk
  check (latitude is null or (latitude >= -90 and latitude <= 90));

alter table public.listings
  drop constraint if exists listings_longitude_range_chk;
alter table public.listings
  add constraint listings_longitude_range_chk
  check (longitude is null or (longitude >= -180 and longitude <= 180));

create index if not exists listings_lat_lng_idx on public.listings (latitude, longitude);
