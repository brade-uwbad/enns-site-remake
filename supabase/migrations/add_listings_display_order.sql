-- Manual sort order for listings (admin drag-and-drop on the listings page).
alter table public.listings
  add column if not exists display_order integer not null default 0;

-- Preserve current "most recently updated first" order as the initial sequence.
with ranked as (
  select
    id,
    row_number() over (partition by status order by updated_at desc) as rn
  from public.listings
)
update public.listings as l
set display_order = ranked.rn
from ranked
where l.id = ranked.id;

create index if not exists listings_status_display_order_idx
  on public.listings (status, display_order);
