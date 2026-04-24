create index if not exists listings_homepage_featured_public_idx
  on public.listings (id)
  where visibility = true
    and homepage_featured = true
    and is_stub = false
    and type in ('community', 'business')
    and photos is not null;
