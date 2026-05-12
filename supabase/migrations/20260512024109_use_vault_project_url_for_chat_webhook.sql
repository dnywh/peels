-- Hosted Postgres cannot resolve the local Supabase Docker hostname
-- `kong:8000`. Read the project URL from Vault so the chat email webhook can
-- call the deployed Edge Function in every environment.

create or replace function private.notify_new_chat_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  webhook_secret text;
  project_url text;
begin
  if to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then
    raise warning 'Skipping chat message email webhook because pg_net is unavailable.';
    return new;
  end if;

  if to_regclass('vault.decrypted_secrets') is not null then
    execute
      'select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1'
      into webhook_secret
      using 'PEELS_CHAT_MESSAGE_WEBHOOK_SECRET';

    execute
      'select decrypted_secret from vault.decrypted_secrets where name = $1 limit 1'
      into project_url
      using 'PEELS_SUPABASE_PROJECT_URL';
  end if;

  if webhook_secret is null or webhook_secret = '' then
    raise warning 'Skipping chat message email webhook because PEELS_CHAT_MESSAGE_WEBHOOK_SECRET is not set in Vault.';
    return new;
  end if;

  if project_url is null or project_url = '' then
    raise warning 'Skipping chat message email webhook because PEELS_SUPABASE_PROJECT_URL is not set in Vault.';
    return new;
  end if;

  begin
    perform net.http_post(
      url := rtrim(project_url, '/') || '/functions/v1/send-email-for-new-chat-message',
      body := jsonb_build_object(
        'type', tg_op,
        'table', tg_table_name,
        'schema', tg_table_schema,
        'record', jsonb_build_object('id', new.id),
        'old_record', null
      ),
      params := '{}'::jsonb,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-peels-webhook-secret', webhook_secret
      ),
      timeout_milliseconds := 5000
    );
  exception
    when others then
      raise warning 'Skipping chat message email webhook because the request failed: %', sqlerrm;
  end;

  return new;
end;
$$;

alter function private.notify_new_chat_message() owner to postgres;

revoke all privileges on function private.notify_new_chat_message()
  from anon, authenticated, public;
