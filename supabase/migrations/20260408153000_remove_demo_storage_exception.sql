begin;

-- Remove the temporary demo-path exception so hosted environments are strictly
-- owner-based for Storage mutations as well.

drop policy if exists "Allow authenticated changes 1oj01fe_0" on storage.objects;
create policy "Allow authenticated changes 1oj01fe_0"
on storage.objects
for update
to authenticated
using (
  (bucket_id = 'avatars')
  and owner = (select auth.uid())
)
with check (
  (bucket_id = 'avatars')
  and owner = (select auth.uid())
);

drop policy if exists "Allow authenticated deletes 1oj01fe_0" on storage.objects;
create policy "Allow authenticated deletes 1oj01fe_0"
on storage.objects
for delete
to authenticated
using (
  (bucket_id = 'avatars')
  and owner = (select auth.uid())
);

drop policy if exists "Allow authenticated list 1oj01fe_0" on storage.objects;
create policy "Allow authenticated list 1oj01fe_0"
on storage.objects
for select
to authenticated
using (
  (bucket_id = 'avatars')
  and owner = (select auth.uid())
);

drop policy if exists "Users can delete their own listing avatars" on storage.objects;
create policy "Users can delete their own listing avatars"
on storage.objects
for delete
to authenticated
using (
  (bucket_id = 'listing_avatars')
  and owner = (select auth.uid())
);

drop policy if exists "Users can delete their own listing photos" on storage.objects;
create policy "Users can delete their own listing photos"
on storage.objects
for delete
to authenticated
using (
  (bucket_id = 'listing_photos')
  and owner = (select auth.uid())
);

drop policy if exists "Users can update their own listing avatars" on storage.objects;
create policy "Users can update their own listing avatars"
on storage.objects
for update
to authenticated
using (
  (bucket_id = 'listing_avatars')
  and owner = (select auth.uid())
)
with check (
  (bucket_id = 'listing_avatars')
  and owner = (select auth.uid())
);

drop policy if exists "Users can update their own listing photos" on storage.objects;
create policy "Users can update their own listing photos"
on storage.objects
for update
to authenticated
using (
  (bucket_id = 'listing_photos')
  and owner = (select auth.uid())
)
with check (
  (bucket_id = 'listing_photos')
  and owner = (select auth.uid())
);

commit;
