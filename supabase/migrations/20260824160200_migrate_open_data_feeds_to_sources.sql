-- Align preview branches that applied the earlier feed-based open data migrations
-- before the sources rename. Fresh production installs already use open_data_sources.

do $$
begin
  if to_regclass('public.open_data_feeds') is null then
    return;
  end if;

  alter table public.open_data_feeds rename to open_data_sources;

  alter table public.listing_open_data_refs
    rename column feed_id to source_id;

  alter index if exists listing_open_data_refs_feed_active_idx
    rename to listing_open_data_refs_source_active_idx;

  alter table public.open_data_sources
    add column if not exists source_type text,
    add column if not exists default_import_mode text;

  alter table public.open_data_sources
    alter column api_url drop not null;

  update public.open_data_sources
  set
    source_type = coalesce(source_type, 'api'),
    default_import_mode = coalesce(default_import_mode, 'complete_snapshot')
  where source_type is null
     or default_import_mode is null;

  alter table public.open_data_sources
    alter column source_type set not null,
    alter column default_import_mode set not null;

  alter table public.open_data_sources
    drop constraint if exists open_data_sources_api_url_required_for_api;

  alter table public.open_data_sources
    add constraint open_data_sources_api_url_required_for_api
      check (
        source_type <> 'api'
        or (api_url is not null and api_url <> '')
      );
end;
$$;

create or replace function private.invoke_open_data_sync(p_source_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
  project_url text;
begin
  if to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then
    raise warning 'Skipping open data sync because pg_net is unavailable.';
    return;
  end if;

  if to_regclass('vault.decrypted_secrets') is not null then
    execute
      'select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1'
      into webhook_secret
      using 'PEELS_OPEN_DATA_SYNC_SECRET';

    execute
      'select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1'
      into project_url
      using 'PEELS_SUPABASE_PROJECT_URL';
  end if;

  if webhook_secret is null or webhook_secret = '' then
    raise warning 'Skipping open data sync because PEELS_OPEN_DATA_SYNC_SECRET is not set in Vault.';
    return;
  end if;

  if project_url is null or project_url = '' then
    raise warning 'Skipping open data sync because PEELS_SUPABASE_PROJECT_URL is not set in Vault.';
    return;
  end if;

  begin
    perform net.http_post(
      url := rtrim(project_url, '/') || '/functions/v1/sync-open-data-feed',
      body := jsonb_build_object('source_id', p_source_id),
      params := '{}'::jsonb,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-peels-webhook-secret', webhook_secret
      ),
      timeout_milliseconds := 120000
    );
  exception
    when others then
      raise warning 'Open data sync request failed: %', sqlerrm;
  end;
end;
$$;

update public.open_data_sources
set
  source_type = 'api',
  default_import_mode = 'complete_snapshot'
where id = 'nyc-dsny-food-scrap';
