begin;

-- Backfill Storage RLS policies that already exist in the hosted project but
-- were not captured in the initial public-schema baseline pull.

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow authenticated changes 1oj01fe_0'
  ) then
    execute $policy$
      create policy "Allow authenticated changes 1oj01fe_0"
      on storage.objects
      for update
      to authenticated
      using ((bucket_id = 'avatars') and (auth.role() = 'authenticated'))
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow authenticated changes 1oj01fe_1'
  ) then
    execute $policy$
      create policy "Allow authenticated changes 1oj01fe_1"
      on storage.objects
      for insert
      to authenticated
      with check ((bucket_id = 'avatars') and (auth.role() = 'authenticated'))
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow authenticated deletes 1oj01fe_0'
  ) then
    execute $policy$
      create policy "Allow authenticated deletes 1oj01fe_0"
      on storage.objects
      for delete
      to authenticated
      using ((bucket_id = 'avatars') and (auth.role() = 'authenticated'))
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Allow authenticated list 1oj01fe_0'
  ) then
    execute $policy$
      create policy "Allow authenticated list 1oj01fe_0"
      on storage.objects
      for select
      to authenticated
      using (bucket_id = 'avatars')
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Anyone can view listing avatars'
  ) then
    execute $policy$
      create policy "Anyone can view listing avatars"
      on storage.objects
      for select
      using (bucket_id = 'listing_avatars')
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Anyone can view listing photos'
  ) then
    execute $policy$
      create policy "Anyone can view listing photos"
      on storage.objects
      for select
      using (bucket_id = 'listing_photos')
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their own listing avatars'
  ) then
    execute $policy$
      create policy "Users can delete their own listing avatars"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'listing_avatars')
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can delete their own listing photos'
  ) then
    execute $policy$
      create policy "Users can delete their own listing photos"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'listing_photos')
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update their own listing avatars'
  ) then
    execute $policy$
      create policy "Users can update their own listing avatars"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'listing_avatars')
      with check (auth.role() = 'authenticated')
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can update their own listing photos'
  ) then
    execute $policy$
      create policy "Users can update their own listing photos"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'listing_photos')
      with check (auth.role() = 'authenticated')
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own listing avatars'
  ) then
    execute $policy$
      create policy "Users can upload their own listing avatars"
      on storage.objects
      for insert
      to authenticated
      with check ((bucket_id = 'listing_avatars') and (auth.role() = 'authenticated'))
    $policy$;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Users can upload their own listing photos'
  ) then
    execute $policy$
      create policy "Users can upload their own listing photos"
      on storage.objects
      for insert
      to authenticated
      with check ((bucket_id = 'listing_photos') and (auth.role() = 'authenticated'))
    $policy$;
  end if;
end
$$;

commit;
