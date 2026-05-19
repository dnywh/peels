begin;

create or replace function public.append_listing_photo(
  p_listing_slug text,
  p_photo text,
  p_owner_id uuid
)
returns table (
  id bigint,
  photos text[]
)
language plpgsql
set search_path = public
as $$
declare
  updated_listing record;
begin
  update public.listings
  set photos = array_append(coalesce(public.listings.photos, array[]::text[]), p_photo)
  where public.listings.slug = p_listing_slug
    and public.listings.owner_id = p_owner_id
    and cardinality(coalesce(public.listings.photos, array[]::text[])) < 5
  returning public.listings.id, public.listings.photos
    into updated_listing;

  if found then
    return query select updated_listing.id, updated_listing.photos;
    return;
  end if;

  if exists (
    select 1
    from public.listings
    where listings.slug = p_listing_slug
      and listings.owner_id = p_owner_id
      and cardinality(coalesce(listings.photos, array[]::text[])) >= 5
  ) then
    raise exception 'max_photos_per_listing'
      using errcode = '23514', constraint = 'max_photos_per_listing';
  end if;
end;
$$;

revoke all on function public.append_listing_photo(text, text, uuid)
  from anon, authenticated, public;
grant execute on function public.append_listing_photo(text, text, uuid)
  to service_role;

revoke all on function public.unread_chat_thread_ids(uuid[])
  from public, anon;
grant execute on function public.unread_chat_thread_ids(uuid[])
  to authenticated, service_role;

commit;
