-- Preview branches that failed 60200 at CREATE OR REPLACE still have
-- invoke_open_data_sync(p_feed_id). Drop and recreate with p_source_id.

drop function if exists private.invoke_open_data_sync(text);

create function private.invoke_open_data_sync(p_source_id text)
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

alter function private.invoke_open_data_sync(text) owner to postgres;

revoke all privileges on function private.invoke_open_data_sync(text)
  from anon, authenticated, public;
