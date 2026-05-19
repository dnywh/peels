-- Read-only helper for identifying orphaned media objects.
--
-- Do not delete from storage.objects in SQL. Supabase Storage docs state that
-- SQL deletes only remove metadata and leave the underlying object orphaned.
-- Use `npm run media:cleanup-orphans` to delete files through the Storage API.

with referenced_media as (
  select
    'avatars'::text as bucket_id,
    profiles.avatar as name
  from public.profiles
  where profiles.avatar is not null

  union all

  select
    'listing_avatars'::text as bucket_id,
    listings.avatar as name
  from public.listings
  where listings.avatar is not null

  union all

  select
    'listing_photos'::text as bucket_id,
    unnest(listings.photos) as name
  from public.listings
  where listings.photos is not null

  union all

  select
    pending_media_uploads.bucket as bucket_id,
    pending_media_uploads.path as name
  from public.pending_media_uploads
  where pending_media_uploads.created_at >= now() - interval '1 day'
)
select
  storage.objects.bucket_id,
  storage.objects.name,
  storage.objects.created_at,
  storage.objects.updated_at,
  storage.objects.metadata ->> 'size' as size_bytes
from storage.objects
where storage.objects.bucket_id in (
  'avatars',
  'listing_avatars',
  'listing_photos'
)
and storage.objects.created_at <= now()
and storage.objects.name !~ '(^|/)\.emptyFolderPlaceholder$'
and not exists (
  select 1
  from referenced_media
  where referenced_media.bucket_id = storage.objects.bucket_id
    and referenced_media.name = storage.objects.name
)
order by storage.objects.bucket_id, storage.objects.name;
