alter table public.profiles
add column if not exists preferred_locale text;

alter table public.profiles
drop constraint if exists profiles_preferred_locale_check;

alter table public.profiles
add constraint profiles_preferred_locale_check
check (
  preferred_locale is null
  or preferred_locale in ('en', 'es', 'de', 'pt-BR', 'fr')
);

create or replace function public.handle_new_user() returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    is_newsletter_subscribed,
    preferred_locale,
    http_referrer,
    utm_source,
    utm_medium,
    utm_campaign
  )
  values (
    new.id,
    (new.raw_user_meta_data->>'first_name')::text,
    (new.raw_user_meta_data->>'is_newsletter_subscribed')::boolean,
    case
      when (new.raw_user_meta_data->>'preferred_locale')::text in ('en', 'es', 'de', 'pt-BR', 'fr')
        then (new.raw_user_meta_data->>'preferred_locale')::text
      else null
    end,
    (new.raw_user_meta_data->>'http_referrer')::text,
    (new.raw_user_meta_data->>'utm_source')::text,
    (new.raw_user_meta_data->>'utm_medium')::text,
    (new.raw_user_meta_data->>'utm_campaign')::text
  );

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;
