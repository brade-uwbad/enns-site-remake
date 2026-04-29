create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  subtitle text,
  description text,
  price_cents integer,
  address_line1 text,
  city text,
  province text,
  postal_code text,
  beds integer,
  baths numeric,
  sqft integer,
  status text not null check (status in ('active', 'sold', 'draft')),
  sold_at timestamptz,
  featured_image_url text,
  images text[] not null default '{}',
  amenities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid
);

create index if not exists listings_status_idx on public.listings(status);
create index if not exists listings_updated_at_idx on public.listings(updated_at desc);
create index if not exists listings_city_idx on public.listings(city);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();
