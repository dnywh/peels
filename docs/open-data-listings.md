# Open data listings

Peels mirrors official public drop-off datasets into stub listings on the map.
The app reads from Supabase, not from council or city APIs at render time.

## Why mirror instead of live queries

- Map viewport loads must stay fast and predictable.
- Socrata and other open data APIs can rate-limit or change shape without notice.
- Stub listings already match the product model: visible on the map, not
  contactable, claimable by a real host later.

## Data model

### `public.open_data_sources`

Registry of official datasets. Service-role only. A source may be fetched from
an API, a remote file URL, or a council spreadsheet you import manually.

| Column                                                | Purpose                                            |
| ----------------------------------------------------- | -------------------------------------------------- |
| `id`                                                  | Stable slug, e.g. `nyc-dsny-food-scrap`            |
| `name`, `source_name`, `source_url`                   | Operator docs and optional listing links           |
| `source_type`                                         | `api`, `manual_file`, or `remote_file`             |
| `api_url`                                             | Remote fetch endpoint (required for `api` sources) |
| `mapper_id`                                           | Which TypeScript mapper to run                     |
| `sync_cron`                                           | Schedule hint for API sources; cron lives in SQL   |
| `default_avatar`                                      | Shared `listing_avatars` path for this source      |
| `default_import_mode`                                 | `complete_snapshot` or `partial_update`            |
| `last_sync_at`, `last_sync_status`, `last_sync_stats` | Observability for API sync runs                    |

### `public.listing_open_data_refs`

Join table linking upstream records to Peels listings. Service-role only.

| Column                     | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `source_id`, `external_id` | Composite primary key                         |
| `listing_id`               | FK to `public.listings`                       |
| `source_version`           | Remote version when available                 |
| `content_hash`             | Hash of normalised mapped payload             |
| `last_seen_at`             | Updated every successful import pass          |
| `sync_status`              | `active`, `removed_from_source`, or `claimed` |

### Read model flag

`public.public_listings.is_open_data_mirrored` and the matching
`listing_contact_cards` column are derived from active refs via
`private.listing_is_open_data_mirrored()`. The UI uses this flag to choose stub
copy. Source names and official URLs stay on `open_data_sources`, not on the
public catalogue.

## API sync flow (NYC and other `source_type = api` rows)

```text
pg_cron (weekly)
  -> pg_net POST /functions/v1/sync-open-data-feed
    -> fetch remote dataset
    -> map rows with source-specific mapper
    -> upsert listings + refs
    -> soft-hide removed rows when default_import_mode = complete_snapshot
    -> write last_sync_stats on open_data_sources
```

Manual invoke:

```bash
PEELS_OPEN_DATA_SYNC_SECRET=... npm run sync:open-data -- nyc-dsny-food-scrap
```

Or POST directly (uses `FUNCTIONS_URL` from `supabase status`):

```bash
curl -sS -X POST "$(supabase status -o env | rg '^FUNCTIONS_URL=' | cut -d= -f2- | tr -d '\"')/sync-open-data-feed" \
  -H 'Content-Type: application/json' \
  -H "x-peels-webhook-secret: $PEELS_OPEN_DATA_SYNC_SECRET" \
  -d '{"source_id":"nyc-dsny-food-scrap"}'
```

Council CSV/XLSX files use the same tables and refs, but a local file importer
(not the edge function). That importer is planned in a follow-up PR.

## Per-run behaviour (API sources)

1. Load source config from `open_data_sources`.
2. Reject sources where `source_type <> 'api'`.
3. Fetch the full remote dataset.
4. For each mapped row:
   - compute `content_hash`
   - if ref exists and hash unchanged: touch `last_seen_at`
   - if ref exists and hash changed: update listing unless `sync_status = claimed`
   - if no ref: insert stub listing and ref
5. When `default_import_mode = complete_snapshot`, for active refs missing from
   the current fetch:
   - set listing `visibility = false`
   - set ref `sync_status = removed_from_source`
6. Write source-level sync summary.

Claiming detaches a listing from automated updates:

- set `is_stub = false`
- assign the real `owner_id`
- set ref `sync_status = claimed`

## NYC source (`nyc-dsny-food-scrap`)

- Dataset: [Food Scrap Drop-Off Locations in NYC](https://data.cityofnewyork.us/Environment/Food-Scrap-Drop-Off-Locations-in-NYC/if26-z6xq/about_data)
- `source_type`: `api`
- `default_import_mode`: `complete_snapshot`
- API: `https://data.cityofnewyork.us/api/v3/views/if26-z6xq/query.geojson`
- External id: `object_id`
- Mapper: `supabase/functions/_shared/open-data/nyc-dsny.ts`
- Owner account: Stubs USA (`PEELS_OPEN_DATA_OWNER_ID_USA` in Vault)
- Listing type: `community`
- Official URLs: `listings.links` uses the row `website` only
- About text: labeled Location, Hosted by, Open, Hours, Notes, with a line break after each label
- Accepted/rejected chips come from DSNY programme copy, not the Open Data dictionary spreadsheet:
  - Smart Compost bins (`hosted_by` = Department of Sanitation): all food scraps including meat and dairy
  - Other drop-offs: fruit, veg, eggshells, coffee/tea, bread/rice/pasta, plant waste; no meat, fish, bones, dairy, oil, or prepared food

  Source: [Food Scrap Drop-Off](https://www.nyc.gov/site/dsny/collection/residents/food-scrap-drop-off.page). Site notes stay in About.

## NYC Open Data app token

Not required for a first manual sync. SODA allows anonymous reads, but anonymous
traffic is throttled by IP.

For scheduled production syncs, register a free Socrata app token and store it as
`PEELS_NYC_OPEN_DATA_APP_TOKEN`. The edge function sends it as `X-App-Token` when
present. Do not commit the token or expose it via `NEXT_PUBLIC_*`.

## Secrets (Vault / edge function env)

| Name                            | Required     | Purpose                               |
| ------------------------------- | ------------ | ------------------------------------- |
| `PEELS_OPEN_DATA_SYNC_SECRET`   | yes          | Auth for cron/manual API sync invokes |
| `PEELS_OPEN_DATA_OWNER_ID_USA`  | yes for NYC  | Stubs USA profile UUID                |
| `PEELS_NYC_OPEN_DATA_APP_TOKEN` | optional     | Higher Socrata rate limits            |
| `PEELS_SUPABASE_PROJECT_URL`    | yes for cron | Used by pg_cron pg_net call           |

Set edge function secrets in the Supabase dashboard for production. For local
development, put them in `supabase/functions/.env` (loaded by `supabase start`).
Set Vault secrets in the SQL editor for production cron.

## Local testing (before merge)

Confirm URLs with `npm run supabase:status`. Peels API is `http://127.0.0.1:54331` so it can run beside other local Supabase stacks. Sync uses `FUNCTIONS_URL` from that output. There is no `supabase functions invoke`; use `npm run sync:open-data` or HTTP POST.

| File                      | Purpose                           |
| ------------------------- | --------------------------------- |
| `.env.local`              | Next.js only                      |
| `supabase/functions/.env` | Edge secrets for `supabase start` |

```bash
npm run supabase:reset
cp supabase/functions/.env.example supabase/functions/.env
supabase stop && supabase start
node scripts/verify-open-data-sync.mjs
PEELS_OPEN_DATA_SYNC_SECRET=local-dev-open-data-sync npm run sync:open-data -- nyc-dsny-food-scrap
```

`supabase start` serves functions. Use `functions serve` only for hot reload while editing function code.

### Local avatars

Upload the NYC mark to local Studio Storage under `listing_avatars/stubs/`, then:

```sql
update public.open_data_sources
set default_avatar = 'stubs/nyc-dsny-food-scrap.png'
where id = 'nyc-dsny-food-scrap';
```

Re-run sync, or backfill the smoke-test listing:

```sql
update public.listings
set avatar = 'stubs/nyc-dsny-food-scrap.png'
where id in (
  select listing_id from public.listing_open_data_refs
  where source_id = 'nyc-dsny-food-scrap' and sync_status = 'active'
);
```

The smoke test alone leaves `avatar` null.

## Adding another source

1. Add a row to `open_data_sources`, including `source_type`, `default_avatar`
   when the mark exists, and `default_import_mode`.
2. Implement a mapper under `supabase/functions/_shared/open-data/`.
3. For API sources: extend the edge function dispatch and optionally register cron.
4. For council files: add a source-specific mapper and use the file importer (PR
   follow-up).
5. Add unit tests beside the mapper or in `src/lib/open-data/`.
6. Upload the shared avatar to `listing_avatars` on that environment.
7. Document the source here and in the Notion wiki.

## Stub copy

Manual stubs and mirrored stubs share the claim CTA but use different trust copy:

- manual: Peels team stub
- mirrored: official public data, not host-managed, verify before visiting

Official source URLs belong in listing links, not in the stub CTA.

## Shared source avatars

Use one image per source, the same way Boston and Brisbane stubs share one
manually uploaded file in `listing_avatars`. Do not generate a unique avatar
per drop-off site.

Community listing avatars always load from the `listing_avatars` bucket. The
value in `listings.avatar` is the object path, not a public URL. Many listings
may store the same path. Orphan cleanup keeps the file while any listing still
points at it.

### Storage path convention

Storage object paths use underscores to match Peels bucket and database naming.
Source slugs in filenames stay kebab-case, same as `open_data_sources.id`.

| Layer         | Example                         | Convention                  |
| ------------- | ------------------------------- | --------------------------- |
| Bucket        | `listing_avatars`               | snake_case                  |
| Folder prefix | `stubs/`                        | snake_case                  |
| Filename      | `nyc-dsny-food-scrap.png`       | kebab-case slug             |
| Full path     | `stubs/nyc-dsny-food-scrap.png` | stored in `listings.avatar` |

TypeScript mapper code lives under `supabase/functions/_shared/open-data/`.
That is a code path convention only; do not use hyphens in Storage folder names.

### Wiring

Store the path on `open_data_sources.default_avatar`, for example:

`stubs/nyc-dsny-food-scrap.png`

The API sync copies `default_avatar` onto listings during insert and content
updates. Claimed listings are skipped by sync and keep the host avatar.

Keep avatar out of `content_hash` so changing a source mark does not rewrite
descriptions.

To backfill after upload:

```sql
update public.open_data_sources
set default_avatar = 'stubs/nyc-dsny-food-scrap.png'
where id = 'nyc-dsny-food-scrap';

update public.listings
set avatar = 'stubs/nyc-dsny-food-scrap.png'
where id in (
  select listing_id
  from public.listing_open_data_refs
  where source_id = 'nyc-dsny-food-scrap'
    and sync_status = 'active'
);
```

### Upload workflow

1. Export a square JPEG or PNG, same crop style as other council stubs.
2. In Studio, Storage, `listing_avatars`, upload into the `stubs/` folder with
   a stable filename such as `stubs/nyc-dsny-food-scrap.png`. This prefix
   groups official source marks separately from per-host avatar uploads.
3. Copy the object **name/path** (not the public URL) into
   `open_data_sources.default_avatar`, then re-run sync or backfill listings as
   above.
4. Repeat the upload on each environment. Local Docker Storage, staging, and
   production do not share files.

Do not put source marks in the `static` bucket. That would need Avatar and
read-model changes. A shared `listing_avatars` path matches Boston and
Brisbane with no UI work.

### Do not delete one shared-avatar listing

`delete-listing` deletes the storage object for that listing's `avatar`. If
hundreds of NYC rows share one file, deleting one listing can blank the mark
for all of them. Soft-hiding (`visibility = false`) does not delete the file.
Until delete counts remaining refs, do not use delete-listing on a mirrored
stub that shares an avatar. Prefer hiding, or delete only in bulk after you
are ready to drop the shared file.

## Council file imports (planned)

Council spreadsheets are `source_type = manual_file`. They share
`open_data_sources`, `listing_open_data_refs`, and mirrored stub UX, but are
imported via a local maintainer script with dry-run by default. Original files
should be archived in a private Supabase Storage bucket named
`official_data_imports` (not a git repo). An `open_data_imports` audit table is
planned in the next PR.

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

Review matches in small batches before enabling cron for that source.

## Related code

- Migrations: `supabase/migrations/20260824160000_open_data_listings_sync.sql`,
  `supabase/migrations/20260824160100_schedule_open_data_sync.sql`
- Edge function: `supabase/functions/sync-open-data-feed/index.ts`
- Manual API sync script: `scripts/sync-open-data-feed.mjs`
- Local smoke test: `scripts/verify-open-data-sync.mjs`
- UI: `src/components/ListingCta/ListingCta.tsx`

See also [supabase-data-architecture.md](./supabase-data-architecture.md).
