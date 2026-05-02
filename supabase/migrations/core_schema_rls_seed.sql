-- Enns Site Remake: core schema, RLS, and profile trigger
-- Apply via Supabase CLI (`supabase db push`) or SQL editor.

create extension if not exists "pgcrypto";

-- Profiles (roles for admin vs public users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  full_name text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- New auth users get a profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  subtitle text,
  description text,
  price_dollars numeric(12, 2),
  address_line text,
  city text,
  province text,
  postal_code text,
  beds int,
  baths numeric(4, 1),
  sqft int,
  status text not null default 'active' check (status in ('active', 'sold', 'draft')),
  sold_at timestamptz,
  featured_image_url text,
  images jsonb not null default '[]'::jsonb,
  amenities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create index listings_status_idx on public.listings (status);
create index listings_city_idx on public.listings (lower(city));
create index listings_price_idx on public.listings (price_dollars);

alter table public.listings enable row level security;

create policy "Public can read active and sold listings"
  on public.listings for select
  using (status in ('active', 'sold'));

-- Site content (homepage, about JSON payloads)
create table public.site_content (
  page_key text primary key check (page_key in ('homepage', 'about')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "Public can read site content"
  on public.site_content for select
  using (true);

-- Services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  body text,
  sort_order int not null default 0
);

alter table public.services enable row level security;

create policy "Public can read services"
  on public.services for select
  using (true);

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  body text not null,
  rating int check (rating is null or (rating >= 1 and rating <= 5)),
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index reviews_visible_idx on public.reviews (is_visible, created_at desc);

alter table public.reviews enable row level security;

create policy "Public can read visible reviews"
  on public.reviews for select
  using (is_visible = true);

-- Contact / valuation requests (server-side inserts only via service role)
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  source text not null default 'contact' check (source in ('contact', 'valuation')),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- No anon policies: API uses service role for inserts.

-- Seed content (idempotent)
insert into public.site_content (page_key, payload)
values
  (
    'homepage',
    jsonb_build_object(
      'aboutSummary', 'Local Kitchener-Waterloo real estate focused on clear guidance and steady communication.',
      'featuredListingIds', '[]'::jsonb,
      'servicesLinks', jsonb_build_array(
        jsonb_build_object('label', 'Buying', 'href', '/services#buying'),
        jsonb_build_object('label', 'Selling', 'href', '/services#selling'),
        jsonb_build_object('label', 'Home appraisal', 'href', '/services#appraisal')
      )
    )
  ),
  (
    'about',
    jsonb_build_object(
      'headline', 'About Brad',
      'bio', 'Placeholder bio. Replace with Brad''s story, credentials, and neighbourhoods served.',
      'contactEmail', 'brad@example.com',
      'contactPhone', '(519) 555-0100'
    )
  )
on conflict (page_key) do nothing;

insert into public.services (slug, title, description, sort_order)
values
  ('buying', 'Buying a home', 'Search strategy, offer guidance, and closing support.', 1),
  ('selling', 'Selling your home', 'Pricing, staging tips, marketing, and negotiation.', 2),
  ('appraisal', 'Home appraisal', 'Context on value drivers and what to expect from an appraisal.', 3)
on conflict (slug) do nothing;
