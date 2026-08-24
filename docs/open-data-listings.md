# Open data listings

Peels mirrors official public drop-off datasets into stub listings on the map.
The app reads from Supabase, not from council or city APIs at render time.

## Why mirror instead of live queries

- Map viewport loads must stay fast and predictable.
- Socrata and other open data APIs can rate-limit or change shape without notice.
- Stub listings already match the product model: visible on the map, not
  contactable, claimable by a real host later.

## Data model

### `public.open_data_feeds`

Registry of replicable sources. Service-role only.

| Column                                                | Purpose                                        |
| ----------------------------------------------------- | ---------------------------------------------- |
| `id`                                                  | Stable slug, e.g. `nyc-dsny-food-scrap`        |
| `name`, `source_name`, `source_url`                   | Operator docs and optional listing links       |
| `api_url`                                             | Remote fetch endpoint                          |
| `mapper_id`                                           | Which TypeScript mapper to run                 |
| `sync_cron`                                           | Schedule hint; actual cron lives in migrations |
| `default_avatar`                                      | Shared `listing_avatars` path for this feed    |
| `last_sync_at`, `last_sync_status`, `last_sync_stats` | Observability                                  |

### `public.listing_open_data_refs`

Join table linking remote records to Peels listings. Service-role only.

| Column                   | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `feed_id`, `external_id` | Composite primary key                         |
| `listing_id`             | FK to `public.listings`                       |
| `source_version`         | Remote version when available                 |
| `content_hash`           | Hash of normalised mapped payload             |
| `last_seen_at`           | Updated every successful sync pass            |
| `sync_status`            | `active`, `removed_from_source`, or `claimed` |

### Read model flag

`public.public_listings.is_open_data_mirrored` and the matching
`listing_contact_cards` column are derived from active refs via
`private.listing_is_open_data_mirrored()`. The UI uses this flag to choose stub
copy. Feed names and source URLs stay on `open_data_feeds`, not on the public
catalogue.

## Sync flow

```text
pg_cron (weekly)
  -> pg_net POST /functions/v1/sync-open-data-feed
    -> fetch remote dataset
    -> map rows with feed-specific mapper
    -> upsert listings + refs
    -> soft-hide removed rows
    -> write last_sync_stats on open_data_feeds
```

Manual invoke:

```bash
PEELS_OPEN_DATA_SYNC_SECRET=... npm run sync:open-data -- nyc-dsny-food-scrap
```

Or:

```bash
supabase functions invoke sync-open-data-feed \
  --body '{"feed_id":"nyc-dsny-food-scrap"}' \
  --header "x-peels-webhook-secret: $PEELS_OPEN_DATA_SYNC_SECRET"
```

## Per-run behaviour

1. Load feed config from `open_data_feeds`.
2. Fetch the full remote dataset.
3. For each mapped row:
   - compute `content_hash`
   - if ref exists and hash unchanged: touch `last_seen_at`
   - if ref exists and hash changed: update listing unless `sync_status = claimed`
   - if no ref: insert stub listing and ref
4. For active refs missing from the current fetch:
   - set listing `visibility = false`
   - set ref `sync_status = removed_from_source`
5. Write feed-level sync summary.

Claiming detaches a listing from automated updates:

- set `is_stub = false`
- assign the real `owner_id`
- set ref `sync_status = claimed`

## NYC feed (`nyc-dsny-food-scrap`)

- Dataset: [Food Scrap Drop-Off Locations in NYC](https://data.cityofnewyork.us/Environment/Food-Scrap-Drop-Off-Locations-in-NYC/if26-z6xq/about_data)
- API: `https://data.cityofnewyork.us/api/v3/views/if26-z6xq/query.geojson`
- External id: `object_id`
- Mapper: `supabase/functions/_shared/open-data/nyc-dsny.ts`
- Owner account: Stubs USA (`PEELS_OPEN_DATA_OWNER_ID_USA` in Vault)
- Listing type: `community`
- Official URLs: stored in `listings.links` (`website`, smart compost app links)

Accepted/rejected sanitisation:

- DSNY smart compost bins: accept all food scraps including meat and dairy
- Typical community/GrowNYC sites with meat/dairy notes: reject meat, bones, dairy
- Ambiguous restrictions stay in the listing description

## NYC Open Data app token

Not required for a first manual sync. SODA allows anonymous reads, but anonymous
traffic is throttled by IP.

For scheduled production syncs, register a free Socrata app token and store it as
`PEELS_NYC_OPEN_DATA_APP_TOKEN`. The edge function sends it as `X-App-Token` when
present. Do not commit the token or expose it via `NEXT_PUBLIC_*`.

## Secrets (Vault / edge function env)

| Name                            | Required     | Purpose                           |
| ------------------------------- | ------------ | --------------------------------- |
| `PEELS_OPEN_DATA_SYNC_SECRET`   | yes          | Auth for cron/manual sync invokes |
| `PEELS_OPEN_DATA_OWNER_ID_USA`  | yes for NYC  | Stubs USA profile UUID            |
| `PEELS_NYC_OPEN_DATA_APP_TOKEN` | optional     | Higher Socrata rate limits        |
| `PEELS_SUPABASE_PROJECT_URL`    | yes for cron | Used by pg_cron pg_net call       |

## Adding another feed

1. Add a row to `open_data_feeds`, including `default_avatar` when the mark exists.
2. Implement a mapper under `supabase/functions/_shared/open-data/`.
3. Extend the edge function dispatch if needed.
4. Add unit tests beside the mapper or in `src/lib/open-data/`.
5. Upload the shared avatar to `listing_avatars` on that environment.
6. Register a cron job or loop enabled feeds from one scheduler.
7. Document the feed here and in the Notion wiki.

## Stub copy

Manual stubs and mirrored stubs share the claim CTA but use different trust copy:

- manual: Peels team stub
- mirrored: official public data, not host-managed, verify before visiting

Official source URLs belong in listing links, not in the stub CTA.

## Shared feed avatars

Use one image per feed, the same way Boston and Brisbane stubs share one
manually uploaded file in `listing_avatars`. Do not generate a unique avatar
per drop-off site.

Community listing avatars always load from the `listing_avatars` bucket. The
value in `listings.avatar` is the object path, not a public URL. Many listings
may store the same path. Orphan cleanup keeps the file while any listing still
points at it.

### Intended wiring

Store the path on `open_data_feeds.default_avatar`, for example:

`open-data/nyc-dsny-food-scrap.png`

The upsert should:

- on insert, copy `default_avatar` onto the new listing
- on unclaimed update, copy the feed avatar so a mark change rolls out on the
  next sync
- on claimed listings, leave the host avatar alone (sync already skips these)

Keep avatar out of `content_hash` so changing the NYC mark does not rewrite
descriptions.

Until that column is copied by `upsert_open_data_listing` (inserts currently
set `avatar` to null), apply the path after the first import:

```sql
update public.listings
set avatar = 'open-data/nyc-dsny-food-scrap.jpg'
where id in (
  select listing_id
  from public.listing_open_data_refs
  where feed_id = 'nyc-dsny-food-scrap'
    and sync_status = 'active'
);
```

### Upload workflow

1. Export a square JPEG or PNG, same crop style as other council stubs.
2. In Studio, Storage, `listing_avatars`, upload it under a stable name such as
   `open-data/nyc-dsny-food-scrap.png`. A dedicated `open-data/` prefix is
   easier to find than a stub-account UUID folder, but either works.
3. Copy the object **name/path** into `open_data_feeds.default_avatar`, then
   onto listings as above.
4. Repeat the upload on each environment. Local Docker Storage, staging, and
   production do not share files.

Do not put feed marks in the `static` bucket. That would need Avatar and
read-model changes. A shared `listing_avatars` path matches Boston and
Brisbane with no UI work.

### Do not delete one shared-avatar listing

`delete-listing` deletes the storage object for that listing's `avatar`. If
hundreds of NYC rows share one file, deleting one listing can blank the mark
for all of them. Soft-hiding (`visibility = false`) does not delete the file.
Until delete counts remaining refs, do not use delete-listing on a mirrored
stub that shares an avatar. Prefer hiding, or delete only in bulk after you
are ready to drop the shared file.

## Backfill for existing manual stubs (phase 3)

Boston, Brisbane, Chicago, and other manually entered stub batches can be linked
later without duplicating pins:

1. Export manual stubs for the target city (name, slug, coordinates, area).
2. Fetch the official dataset and map it with the city mapper.
3. Match candidates in priority order:
   - exact `external_id` if a ref already exists
   - same normalised name within ~50 metres
   - nearest coordinate within ~50 metres with similar name
4. For confident matches:
   - create `listing_open_data_refs` pointing at the existing listing
   - set `content_hash` from the mapped payload
   - leave listing content to the next sync unless the manual row is clearly stale
5. For unmatched official rows: insert new mirrored stubs.
6. For unmatched manual rows with no official counterpart: keep as manual stubs.

Review matches in small batches before enabling cron for that feed.

## Related code

- Migrations: `supabase/migrations/20260824160000_open_data_listings_sync.sql`,
  `supabase/migrations/20260824160100_schedule_open_data_sync.sql`
- Edge function: `supabase/functions/sync-open-data-feed/index.ts`
- Manual script: `scripts/sync-open-data-feed.mjs`
- UI: `src/components/ListingCta/ListingCta.tsx`

See also [supabase-data-architecture.md](./supabase-data-architecture.md).
