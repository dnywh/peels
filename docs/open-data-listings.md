# Open data listings

Peels mirrors official public drop-off datasets into stub listings. The app
reads from Supabase, not from council or city APIs at render time.

**Operations runbooks** (secrets, prod checklists, per-source notes, SQL
backfills): [Open data sync ops](https://www.notion.so/peels/Open-Data-Sync-Ops-3c6b37e1678f818c8d74d64248dec091)
(private wiki).

## Data model

### `public.open_data_sources`

Registry of official datasets (service-role only).

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
| `last_sync_at`, `last_sync_status`, `last_sync_stats` | Observability for sync runs                        |

### `public.listing_open_data_refs`

Join table linking upstream records to Peels listings (service-role only).

| Column                     | Purpose                                       |
| -------------------------- | --------------------------------------------- |
| `source_id`, `external_id` | Composite primary key                         |
| `listing_id`               | FK to `public.listings`                       |
| `source_version`           | Remote version when available                 |
| `content_hash`             | Hash of normalised mapped payload             |
| `last_seen_at`             | Updated every successful import pass          |
| `sync_status`              | `active`, `removed_from_source`, or `claimed` |

`public.public_listings.is_open_data_mirrored` is derived from active refs. The
UI uses it for stub copy; source names and official URLs stay on
`open_data_sources`.

## API sources

Scheduled sync (NYC): `pg_cron` → `sync-open-data-feed` edge function → upsert
listings and refs. Manual invoke:

```bash
PEELS_OPEN_DATA_SYNC_SECRET=... npm run sync:open-data -- nyc-dsny-food-scrap
```

Mapper: `supabase/functions/_shared/open-data/nyc-dsny.ts`. Owner:
`PEELS_OPEN_DATA_OWNER_ID_USA`. See Notion for cron schedule, Socrata app
token, local smoke test, and avatar backfill SQL.

**Cron 504s:** `pg_net` waits up to 120s for the HTTP response. A full NYC pass
with ~590 rows can take a few minutes, so the invoke may show 504 in edge logs
even when the run finishes. Check `open_data_sources.last_sync_at` and
`last_sync_stats` instead of the HTTP status alone. Shared source avatars are
reconciled in one batched pass at the end of each API sync, not per unchanged
row.

## Council file sources

`source_type = manual_file`. Same tables and stub UX; imported with maintainer
scripts, not the edge function.

1. Archive the council's original file in Supabase Storage.
2. `npm run sanitize:open-data -- <source-id> path/to/file.xlsx`
3. `npm run import:open-data -- <source-id>` (dry-run)
4. `npm run import:open-data -- <source-id> --apply`

**Do you need a `data/` folder?** No. Nothing under `data/` belongs in git
(`data/open-data-sanitized/` is gitignored). The sanitize script writes a
temporary JSON file (default:
`data/open-data-sanitized/<source-id>.json`) as a bridge to the import script.
It creates that path when it runs; you can delete it afterwards or pass a custom
output path as the third argument to `sanitize:open-data`. The source of truth
for council files is Storage, not your laptop.

Per-source details (Port Phillip, env vars, prod apply): Notion.

## Adding a source

1. Row in `open_data_sources` (migration or Studio).
2. Mapper under `supabase/functions/_shared/open-data/`.
3. API: extend `sync-open-data-feed` and optional cron. Council file: extend
   `sanitize-open-data-file.mjs` and `import-open-data-file.mjs`.
4. Unit tests in `src/lib/open-data/`.
5. Shared avatar in `listing_avatars` on each environment.
6. Notion runbook for ops.

## Stub copy and avatars

Mirrored stubs use different trust copy from manual Peels stubs (official public
data, verify before visiting). One shared avatar per source in
`listing_avatars/stubs/`; path on `open_data_sources.default_avatar`. Do not
delete a single mirrored listing that shares a source avatar (see Notion).

## Related code

- Migrations: `supabase/migrations/20260824160000_open_data_listings_sync.sql` and follow-ups
- Edge function: `supabase/functions/sync-open-data-feed/`
- API sync: `scripts/sync-open-data-feed.mjs`
- Council file: `scripts/sanitize-open-data-file.mjs`, `scripts/import-open-data-file.mjs`
- UI: `src/components/ListingCta/ListingCta.tsx`

See also [supabase-data-architecture.md](./supabase-data-architecture.md).
