create or replace function public.count_user_listings_by_type(
  _user_id uuid,
  _listing_type text
)
returns integer
language sql
stable
set search_path = public
as $$
  select count(*)::integer
  from public.listings
  where owner_id = _user_id
    and type = _listing_type
$$;

create index if not exists listings_owner_id_type_idx
on public.listings (owner_id, type);

drop policy if exists "Users can create their own listings within limits" on public.listings;
create policy "Users can create their own listings within limits"
on public.listings
for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and type = any (array['residential'::text, 'community'::text, 'business'::text])
  and (
    public.count_user_listings((select auth.uid())) < 12
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  )
  and (
    type <> 'residential'
    or public.count_user_listings_by_type((select auth.uid()), 'residential') < 3
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  )
  and (
    coalesce(is_stub, false) = false
    or exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.is_admin = true
    )
  )
);

revoke all privileges on function public.count_user_listings_by_type(uuid, text)
from anon, authenticated, public;
grant execute on function public.count_user_listings_by_type(uuid, text)
to authenticated;
