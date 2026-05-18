# Supabase data architecture

Peels uses Supabase's Data API deliberately. Tables that are safe API surfaces stay in the exposed `public` schema with RLS and narrow grants. Implementation details and internal-only data live outside the API surface.

This document is safe to keep in the public repo because it describes boundaries and intent, not secrets, keys, or hidden access paths. The database policies and grants remain the source of enforcement.

## Schemas

### `public`

`public` contains the tables and functions the app may reach through the Supabase client. Anything in this schema should be treated as potentially API-addressable, so tables need RLS enabled and role grants should be explicit.

The main public tables are split into two groups:

- Source-of-truth tables that store real application records.
- Read-model tables that expose deliberately shaped data to a specific audience.

## Naming

### Source tables

Source tables are the canonical records. They are the place writes happen and
the place the application should treat as the source of truth.

For example, `public.listings.location` is the canonical listing location.
Other tables may copy or reshape that location for safe reads, but they do not
become the source of truth.

### Read models

A read model is a table shaped for a read use case rather than for canonical
storage. Peels uses read models when different audiences need different columns
from the same underlying records.

This avoids using base tables as both storage and public API. The base table can
keep all fields needed by the product, while each read model exposes only the
fields needed by its audience.

### `contact_cards`

`contact_cards` is Peels naming, not a Postgres or Supabase convention. It means
"small safe display/contact summary".

The important part is the audience boundary:

- `public_listings` is for signed-out public browsing and SEO.
- `listing_contact_cards` is for signed-in listing/contact/chat flows.
- `profile_contact_cards` is for signed-in profile display in allowed
  relationships, especially chat participants.

If a future table needs a different audience or purpose, prefer a name that says
that audience clearly rather than blindly reusing `contact_cards`.

### `private`

`private` is not an exposed Data API schema. It is for database implementation details such as trigger functions, security-definer helpers, and internal-only tables.

Browser clients should not query this schema. Server-side service-role code may use it for trusted internal work when needed.

## Source-of-truth tables

### `public.profiles`

Stores private profile state for each user, including fields that should not be broadly readable through the API. It is not a public profile directory.

Direct reads are owner-scoped. Public or cross-user display needs should use `profile_contact_cards`.

### `public.listings`

Stores full listing records, including owner identity and fields that should not be exposed to signed-out visitors.

Direct writes stay on the base table so listing create/edit/delete flows operate on the canonical record. Public browsing should use `public_listings`; authenticated listing/contact UI should use `listing_contact_cards`.

### `public.chat_threads`

Stores chat thread membership and listing context. Access is participant-scoped through RLS.

The app composes richer chat payloads in TypeScript instead of exposing privileged joined views.

### `public.chat_messages`

Stores chat messages. Access is participant-scoped through RLS, with trigger checks for message sender integrity and rate limits.

### `private.growth_tracking`

Stores internal growth tracking records. It is not part of the client Data API and should be read or written only by trusted server-side or database code.

## Read-model tables

### `public.public_listings`

Signed-out safe listing catalogue used by map, SEO, sitemap, homepage, and public listing pages.

This table intentionally includes public listing content such as description, accepted items, rejected items, type, area/country, coordinates, slug, and low-sensitivity presentation metadata.

`public.listings.location` remains the canonical location source. It is a PostGIS `geography(Point, 4326)` value, which is the right shape for canonical database storage and spatial operations. Signed-out visitors do not read `public.listings` directly, so the public catalogue stores derived location data in the safe read-model row instead.

The location data in `public_listings` has two shapes:

- `coordinates`: JSON shaped as `{ "latitude": number, "longitude": number }` for the app, map components, SEO helpers, and API consumers.
- `latitude` and `longitude`: generated columns derived from `coordinates`, used by `listings_in_view` so viewport queries can use a normal database index instead of casting JSON text during every map request.

This does mean location appears in more than one table, but the source of truth is still singular: `public.listings.location`. The `public_listings` values are a trigger-maintained read model. Within `public_listings`, `latitude` and `longitude` are generated by Postgres from `coordinates`, so those two columns cannot drift from the JSON value.

Do not switch signed-out reads back to `public.listings.location` just to avoid this duplication. That would require exposing the base table to anonymous users or adding a privileged public function/view, which is the privacy and Supabase-dashboard-warning pattern this architecture avoids.

Residential listings keep their description, accepted items, and rejected items public, but owner identity and residential media are hidden:

- `name` is `null` for residential rows.
- `photos` is `null` for residential rows.
- `avatar` is `null` for residential rows.
- `owner_id`, `visibility`, raw `location`, and profile fields are not exposed.

Rows are maintained by database triggers from `public.listings`.

#### `owner_has_multiple_non_residential_listings`

This boolean means: the hidden owner of this listing has more than one visible
business/community listing.

It exists for presentation copy. In chat, if a person reaches out to an owner
who has multiple non-residential listings, the UI can say they reached out about
a specific listing name rather than using more ambiguous generic copy.

The field is low sensitivity because it does not expose the owner id, owner
name, email, profile, or the list of the owner's other listings. It reveals only
that this listing's owner has multiple visible non-residential listings.

Current app code mainly needs this field through `listing_contact_cards` for
authenticated chat flows. It remains on `public_listings` because it was already
part of the public listing read shape and may be useful presentation metadata,
but it is not essential to signed-out browsing today. If public minimisation
becomes stricter later, this is a reasonable candidate to remove from
`public_listings` while keeping it on `listing_contact_cards`.

### `public.listing_contact_cards`

Authenticated listing/contact read model for visible listings, own listings, and chat participant flows.

It includes listing data plus the owner id and safe owner display fields needed to start or display chats. It is still protected by RLS; it is not a signed-out API.

Rows are maintained by database triggers from `public.listings` and `public.profiles`.

### `public.profile_contact_cards`

Authenticated profile display read model with only:

- `id`
- `first_name`
- `avatar`

It is readable for the user themself and for chat participants who need display data. It is not a full profile export.

Rows are maintained by database triggers from `public.profiles`.

## Database helpers

Security-definer helper functions live in `private`, not `public`. Public security-definer functions and public definer views should be avoided because they create confusing API surfaces and Supabase dashboard warnings.

The current helper functions refresh read-model rows, enforce chat message/thread integrity, and support auth/profile setup.

Chat message email notifications are sent through the `send-email-for-new-chat-message` Edge Function. That function is invoked by a database trigger, not by browser clients, so it has `verify_jwt = false` and performs its own shared-secret check with `PEELS_CHAT_MESSAGE_WEBHOOK_SECRET`.

The same webhook secret must exist in two places:

- Supabase Edge Function secrets as `PEELS_CHAT_MESSAGE_WEBHOOK_SECRET`.
- Supabase Vault as `PEELS_CHAT_MESSAGE_WEBHOOK_SECRET`, so the database trigger can send it in the `x-peels-webhook-secret` header.

The database trigger also needs the hosted project URL in Vault:

- Supabase Vault as `PEELS_SUPABASE_PROJECT_URL`, for example `https://<project-ref>.supabase.co`.

Do not use local Supabase Docker hostnames such as `kong:8000` in migrations that run in hosted environments. They work during local `supabase db reset`, but hosted Postgres cannot resolve them.

Do not use the public anon key as the protection boundary for this webhook. The function holds a service-role client so the caller must be authenticated by a non-public secret.

## Storage media cleanup

User-uploaded media lives in public Storage buckets, but the canonical
references live in `public.profiles.avatar`, `public.listings.avatar`, and
`public.listings.photos`.

### Media write boundary

Browser clients must not write Storage objects or media reference columns
directly. Media writes go through `src/app/api/media/upload/route.ts`, which
authenticates the user, optimises the image, writes the Storage object with the
service-role client, and then updates the matching profile/listing reference
after ownership checks.

For new listings, uploads happen before the listing row exists. Those temporary
uploads are tracked in `public.pending_media_uploads`, keyed by user, bucket,
kind, and path. The table is server-owned: authenticated clients cannot insert,
update, or delete rows directly. The upload route creates pending rows through a
service-only RPC that caps active pending listing photos to the listing photo
limit and caps active pending listing avatars to a small per-user limit. When
the listing is saved, the server action validates that every submitted media
path belongs to that user's pending upload set before attaching it to the new
listing. The final pending-row claim and listing media attachment run through
one service-only RPC transaction, so pending rows are not consumed unless the
listing references are committed.

Direct authenticated writes to `public.profiles.avatar`,
`public.listings.avatar`, and `public.listings.photos` are revoked. This is
important because delete routes remove files with the service-role Storage
client; the app must never treat a client-forged media path as proof of
ownership.

Listing photo append/remove and existing-listing reorder operations use RPCs so
array changes are atomic. Those RPCs are service-role only and are called after
the app has verified the signed-in user owns the listing. Reorders only commit
when the current media set still matches the submitted media set, so concurrent
uploads or deletes are not overwritten by a stale save.
Existing listing form saves that include media ordering go through the same
database boundary, so listing field edits and media reorders commit together or
fail together.

Listing and account deletion should clean up media through the Edge Functions
before the database rows are deleted:

- `delete-listing` removes that listing's avatar and photos, then deletes the
  listing row.
- `delete-account` removes the profile avatar plus all owned listing media, then
  deletes the auth user.

Do not add a Postgres Cron job that deletes from `storage.objects`. Supabase
Storage object deletion must go through the Storage API; deleting rows from
`storage.objects` only removes metadata and can leave object bytes behind.

Pending uploads are treated as active for one day. After that, abandoned
new-listing uploads can be reported by the orphan cleanup tooling and removed
through the Storage API.

For historical orphans, first inspect the read-only helper:

```sql
\i supabase/snippets/orphaned-media.sql
```

Then run the Storage API cleanup script in dry-run mode:

```sh
npm run media:cleanup-orphans
```

For hosted environments, pass the project URL and service-role key explicitly
and include `--allow-remote`. Deletion requires both `--delete-orphans` and
`--confirm-delete-orphans`, plus an explicit `--before` cutoff; this keeps the
default path inspect-only and protects in-flight uploads whose database
references have not been written yet.

Example production dry run:

```sh
SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
npm run media:cleanup-orphans -- --allow-remote --before=2026-05-18
```

Example production deletion after reviewing the dry-run output:

```sh
SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY" \
npm run media:cleanup-orphans -- --allow-remote --before=2026-05-18 --delete-orphans --confirm-delete-orphans
```

Storage folder placeholders such as `.emptyFolderPlaceholder` are Supabase
folder bookkeeping objects, not user media. The helper and cleanup script ignore
them.

## Change rules

- Add forward migrations only; do not edit historical migrations once they may have been applied to a preview or production branch.
- Keep `public` tables RLS-enabled.
- Do not add public security-definer views or functions.
- Prefer read-model tables for deliberate API shapes when column-level privacy matters.
- Prefer TypeScript composition for authenticated interaction state such as chat, where materialised joined database views make privacy harder to reason about.
- Keep internal-only tables in `private` unless there is a clear client API reason not to.
