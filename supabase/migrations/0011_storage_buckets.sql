-- 0011_storage_buckets.sql
-- Storage buckets and RLS

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-assets',
  'business-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read for active business assets (for /b/[slug] pages)
create policy "Public read business-assets"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'business-assets');

-- Authenticated users can upload to their own business folder
create policy "Authenticated upload to own business"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = (auth.jwt() ->> 'current_business_id')
);

create policy "Authenticated update own business assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = (auth.jwt() ->> 'current_business_id')
);

create policy "Authenticated delete own business assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'business-assets'
  and (storage.foldername(name))[1] = (auth.jwt() ->> 'current_business_id')
);
