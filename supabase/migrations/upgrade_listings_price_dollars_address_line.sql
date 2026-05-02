-- Align existing databases: cents -> dollars, address_line1 -> address_line, optional subtitle/amenities.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'listings'
      and column_name = 'price_cents'
  ) then
    alter table public.listings rename column price_cents to price_dollars;
    alter table public.listings
      alter column price_dollars type numeric(12, 2)
      using (price_dollars::numeric / 100.0);
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'listings'
      and column_name = 'address_line1'
  ) then
    alter table public.listings rename column address_line1 to address_line;
  end if;
end $$;

alter table public.listings add column if not exists subtitle text;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'listings'
      and column_name = 'amenities'
  ) then
    alter table public.listings
      add column amenities text[] not null default '{}';
  end if;
end $$;

drop index if exists listings_price_idx;
create index if not exists listings_price_idx on public.listings (price_dollars);
