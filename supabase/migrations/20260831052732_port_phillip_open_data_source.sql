insert into public.open_data_sources (
  id,
  name,
  source_name,
  source_url,
  source_type,
  api_url,
  mapper_id,
  sync_cron,
  default_avatar,
  default_import_mode
)
values (
  'port-phillip-fogo-communal',
  'City of Port Phillip communal FOGO bins',
  'City of Port Phillip',
  'https://www.portphillip.vic.gov.au/council-services/waste-recycling-and-rubbish/communal-glass-recycling-and-fogo-recycling-hubs',
  'manual_file',
  null,
  'port-phillip-fogo-v1',
  null,
  'stubs/city-of-port-phillip.jpg',
  'complete_snapshot'
)
on conflict (id) do update set
  name = excluded.name,
  source_name = excluded.source_name,
  source_url = excluded.source_url,
  source_type = excluded.source_type,
  api_url = excluded.api_url,
  mapper_id = excluded.mapper_id,
  sync_cron = excluded.sync_cron,
  default_avatar = excluded.default_avatar,
  default_import_mode = excluded.default_import_mode;
