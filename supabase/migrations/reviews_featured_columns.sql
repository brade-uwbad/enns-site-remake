-- Featured reviews for About page curation (title + display order).
-- Safe to re-run.

alter table public.reviews add column if not exists title text not null default '';
alter table public.reviews add column if not exists is_featured boolean not null default false;
alter table public.reviews add column if not exists display_order int not null default 0;

create index if not exists reviews_featured_idx
  on public.reviews (is_featured, display_order asc, created_at desc)
  where is_featured = true and is_visible = true;
