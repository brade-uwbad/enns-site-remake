-- Reviews (testimonials). Run in Supabase SQL Editor if `reviews` is not created yet.
-- Requires pgcrypto for gen_random_uuid().

create extension if not exists "pgcrypto";

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  author_name text not null,
  body text not null,
  rating int check (rating is null or (rating >= 1 and rating <= 5)),
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  display_order int not null default 1 check (display_order >= 1 and display_order <= 3),
  created_at timestamptz not null default now()
);

create index if not exists reviews_visible_idx on public.reviews (is_visible, created_at desc);

alter table public.reviews enable row level security;

drop policy if exists "Public can read visible reviews" on public.reviews;

create policy "Public can read visible reviews"
  on public.reviews for select
  using (is_visible = true);
