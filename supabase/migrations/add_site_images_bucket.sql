-- Public storage bucket for editable site imagery (e.g. the homepage hero
-- background). Uploads are performed with the service-role key, which bypasses
-- storage RLS, so only the public-read bucket itself is needed here.
-- Safe to run repeatedly.

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;
