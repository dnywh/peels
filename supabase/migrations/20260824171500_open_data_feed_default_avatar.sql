alter table public.open_data_feeds
  add column if not exists default_avatar text;
