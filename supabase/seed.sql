-- Local-only sample data for `supabase db reset`.
-- Keep this sanitized and reproducible. Do not copy production data here.

begin;

-- Demo accounts for local sign-in.
-- Password for both accounts: peels-demo-password
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  email_change_token_current,
  reauthentication_token,
  is_sso_user,
  is_anonymous
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '2c9ae20c-2469-4e60-84b3-39268697717c',
    'authenticated',
    'authenticated',
    'demo-host@peels.local',
    '$2a$10$lyW9fBTRH9ArXpWTMVbIAe8CudAvmToBbIuMIrIAloEqw.ExDcKsS',
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Avery","email_verified":true}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '9a0c62fc-bf50-4f45-ba6c-5b9051c2712a',
    'authenticated',
    'authenticated',
    'demo-donor@peels.local',
    '$2a$10$5AI2H2yT7iRd6rsMcjSmqe/MNvnaKApDluy9eo44gy7kxqeOArucG',
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name":"Riley","email_verified":true}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    '',
    '',
    '',
    false,
    false
  )
on conflict (id) do update
set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = excluded.updated_at;

insert into auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    '90c8f961-beba-4799-a59d-57410afe5ee2',
    '2c9ae20c-2469-4e60-84b3-39268697717c',
    '2c9ae20c-2469-4e60-84b3-39268697717c',
    '{"sub":"2c9ae20c-2469-4e60-84b3-39268697717c","email":"demo-host@peels.local","email_verified":false,"phone_verified":false}'::jsonb,
    'email',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    'fc5f1010-ceed-47f1-8d15-6f795c9be7b9',
    '9a0c62fc-bf50-4f45-ba6c-5b9051c2712a',
    '9a0c62fc-bf50-4f45-ba6c-5b9051c2712a',
    '{"sub":"9a0c62fc-bf50-4f45-ba6c-5b9051c2712a","email":"demo-donor@peels.local","email_verified":false,"phone_verified":false}'::jsonb,
    'email',
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
on conflict (provider_id, provider) do update
set
  user_id = excluded.user_id,
  identity_data = excluded.identity_data,
  last_sign_in_at = excluded.last_sign_in_at,
  updated_at = excluded.updated_at;

insert into public.profiles (
  id,
  first_name,
  avatar,
  is_admin,
  http_referrer,
  utm_source,
  utm_medium,
  utm_campaign,
  is_newsletter_subscribed,
  emailed_latest_issue
)
values
  (
    '2c9ae20c-2469-4e60-84b3-39268697717c',
    'Avery',
    null,
    false,
    'http://127.0.0.1:3000',
    'local-seed',
    'cli',
    'fresh-computer',
    true,
    false
  ),
  (
    '9a0c62fc-bf50-4f45-ba6c-5b9051c2712a',
    'Riley',
    null,
    false,
    'http://127.0.0.1:3000',
    'local-seed',
    'cli',
    'fresh-computer',
    false,
    false
  )
on conflict (id) do update
set
  first_name = excluded.first_name,
  avatar = excluded.avatar,
  updated_at = timezone('utc', now()),
  is_newsletter_subscribed = excluded.is_newsletter_subscribed,
  emailed_latest_issue = excluded.emailed_latest_issue;

insert into public.listings (
  id,
  owner_id,
  name,
  description,
  location,
  accepted_items,
  rejected_items,
  photos,
  links,
  visibility,
  type,
  avatar,
  latitude,
  longitude,
  country_code,
  area_name,
  is_stub
)
values
  (
    1001,
    '2c9ae20c-2469-4e60-84b3-39268697717c',
    'Marrickville Neighbourhood Compost',
    'A friendly local compost drop-off with room for fruit scraps, coffee grounds, and wilted greens.',
    extensions.st_setsrid(extensions.st_makepoint(151.1569, -33.9110), 4326)::extensions.geography,
    array['Fruit and vegetable scraps', 'Coffee grounds', 'Tea leaves', 'Egg shells'],
    array['Plastic bags', 'Meat', 'Dairy'],
    array[]::text[],
    array['https://www.peels.app/about'],
    true,
    'community',
    null,
    -33.9110,
    151.1569,
    'AU',
    'Marrickville',
    false
  ),
  (
    1002,
    '2c9ae20c-2469-4e60-84b3-39268697717c',
    'Inner West Cafe Compost Pickup',
    'A demo business listing so local development exercises the multi-listing host views and badges.',
    extensions.st_setsrid(extensions.st_makepoint(151.1645, -33.9063), 4326)::extensions.geography,
    array['Coffee grounds', 'Fruit scraps'],
    array['Packaging', 'Glass'],
    array[]::text[],
    array['https://www.peels.app/faq'],
    true,
    'business',
    null,
    -33.9063,
    151.1645,
    'AU',
    'Enmore',
    false
  ),
  (
    1003,
    '9a0c62fc-bf50-4f45-ba6c-5b9051c2712a',
    'Newtown Balcony Worm Farm',
    'A small residential setup that is handy for testing profile, listing, and chat flows locally.',
    extensions.st_setsrid(extensions.st_makepoint(151.1781, -33.8986), 4326)::extensions.geography,
    array['Fruit scraps', 'Paper towels', 'Crushed egg shells'],
    array['Citrus in bulk', 'Cooked food'],
    array[]::text[],
    array['https://www.peels.app'],
    true,
    'residential',
    null,
    -33.8986,
    151.1781,
    'AU',
    'Newtown',
    false
  )
on conflict (id) do update
set
  owner_id = excluded.owner_id,
  name = excluded.name,
  description = excluded.description,
  location = excluded.location,
  accepted_items = excluded.accepted_items,
  rejected_items = excluded.rejected_items,
  photos = excluded.photos,
  links = excluded.links,
  visibility = excluded.visibility,
  type = excluded.type,
  avatar = excluded.avatar,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  country_code = excluded.country_code,
  area_name = excluded.area_name,
  is_stub = excluded.is_stub;

update public.listings
set slug = case id
  when 1001 then 'demo-marrickville-compost'
  when 1002 then 'demo-inner-west-cafe'
  when 1003 then 'demo-newtown-worm-farm'
end
where id in (1001, 1002, 1003);

select setval('public.listings_id_seq', 1003, true);

insert into public.chat_threads (
  id,
  created_at,
  listing_id,
  initiator_id,
  owner_id
)
values (
  '33333333-3333-4333-8333-333333333333',
  timezone('utc', now()) - interval '2 hours',
  1001,
  '9a0c62fc-bf50-4f45-ba6c-5b9051c2712a',
  '2c9ae20c-2469-4e60-84b3-39268697717c'
)
on conflict (id) do update
set
  created_at = excluded.created_at,
  listing_id = excluded.listing_id,
  initiator_id = excluded.initiator_id,
  owner_id = excluded.owner_id;

alter table public.chat_messages disable trigger webhook_new_chat_message;

insert into public.chat_messages (
  id,
  created_at,
  thread_id,
  sender_id,
  content,
  read_at
)
values
  (
    '44444444-4444-4444-8444-444444444444',
    timezone('utc', now()) - interval '90 minutes',
    '33333333-3333-4333-8333-333333333333',
    '9a0c62fc-bf50-4f45-ba6c-5b9051c2712a',
    'Hey Avery, do you take coffee grounds from a small home espresso machine?',
    timezone('utc', now()) - interval '80 minutes'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    timezone('utc', now()) - interval '75 minutes',
    '33333333-3333-4333-8333-333333333333',
    '2c9ae20c-2469-4e60-84b3-39268697717c',
    'Yes, absolutely. Small sealed containers are perfect.',
    null
  )
on conflict (id) do update
set
  created_at = excluded.created_at,
  thread_id = excluded.thread_id,
  sender_id = excluded.sender_id,
  content = excluded.content,
  read_at = excluded.read_at;

alter table public.chat_messages enable trigger webhook_new_chat_message;

select
  'seed complete' as status,
  count(*) filter (where visibility = true) as public_listings,
  count(*) filter (where type in ('community', 'business')) as non_residential_listings
from public.listings;

commit;
