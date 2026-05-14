begin;

drop policy if exists "Anyone can view listing avatars" on storage.objects;
drop policy if exists "Anyone can view listing photos" on storage.objects;

update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg']::text[]
where id in ('avatars', 'listing_avatars');

update storage.buckets
set allowed_mime_types = array['image/jpeg']::text[]
where id = 'listing_photos';

revoke delete on table public.listings from authenticated;

create or replace function private.test_cleanup_orphaned_files()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  file record;
begin
  raise notice 'Orphaned profile avatars:';
  for file in
    select name
    from storage.objects
    where bucket_id = 'avatars'
      and name not in (
        select avatar from public.profiles where avatar is not null
      )
  loop
    raise notice '%', file.name;
  end loop;

  raise notice 'Orphaned listing avatars:';
  for file in
    select name
    from storage.objects
    where bucket_id = 'listing_avatars'
      and name not in (
        select avatar from public.listings where avatar is not null
      )
  loop
    raise notice '%', file.name;
  end loop;

  raise notice 'Orphaned listing photos:';
  for file in
    select name
    from storage.objects
    where bucket_id = 'listing_photos'
      and name not in (
        select unnest(photos)
        from public.listings
        where photos is not null
      )
  loop
    raise notice '%', file.name;
  end loop;
end;
$$;

commit;
