begin;

-- Tighten Storage mutation policies so authenticated users can only mutate
-- their own uploaded objects. Keep demo-prefixed seed assets editable locally
-- so the seeded dev flows still work after `supabase db reset`.

drop policy if exists "Allow authenticated changes 1oj01fe_0" on storage.objects;
create policy "Allow authenticated changes 1oj01fe_0"
on storage.objects
for update
to authenticated
using (
  (bucket_id = 'avatars')
  and (
    owner = (select auth.uid())
    or name like 'demo/%'
  )
)
with check (
  (bucket_id = 'avatars')
  and owner = (select auth.uid())
);

drop policy if exists "Allow authenticated changes 1oj01fe_1" on storage.objects;
create policy "Allow authenticated changes 1oj01fe_1"
on storage.objects
for insert
to authenticated
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
  and (
    owner = (select auth.uid())
    or name like 'demo/%'
  )
);

drop policy if exists "Allow authenticated list 1oj01fe_0" on storage.objects;
create policy "Allow authenticated list 1oj01fe_0"
on storage.objects
for select
to authenticated
using (
  (bucket_id = 'avatars')
  and (
    owner = (select auth.uid())
    or name like 'demo/%'
  )
);

drop policy if exists "Users can delete their own listing avatars" on storage.objects;
create policy "Users can delete their own listing avatars"
on storage.objects
for delete
to authenticated
using (
  (bucket_id = 'listing_avatars')
  and (
    owner = (select auth.uid())
    or name like 'demo/%'
  )
);

drop policy if exists "Users can delete their own listing photos" on storage.objects;
create policy "Users can delete their own listing photos"
on storage.objects
for delete
to authenticated
using (
  (bucket_id = 'listing_photos')
  and (
    owner = (select auth.uid())
    or name like 'demo/%'
  )
);

drop policy if exists "Users can update their own listing avatars" on storage.objects;
create policy "Users can update their own listing avatars"
on storage.objects
for update
to authenticated
using (
  (bucket_id = 'listing_avatars')
  and (
    owner = (select auth.uid())
    or name like 'demo/%'
  )
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
  and (
    owner = (select auth.uid())
    or name like 'demo/%'
  )
)
with check (
  (bucket_id = 'listing_photos')
  and owner = (select auth.uid())
);

drop policy if exists "Users can upload their own listing avatars" on storage.objects;
create policy "Users can upload their own listing avatars"
on storage.objects
for insert
to authenticated
with check (
  (bucket_id = 'listing_avatars')
  and owner = (select auth.uid())
);

drop policy if exists "Users can upload their own listing photos" on storage.objects;
create policy "Users can upload their own listing photos"
on storage.objects
for insert
to authenticated
with check (
  (bucket_id = 'listing_photos')
  and owner = (select auth.uid())
);

commit;
