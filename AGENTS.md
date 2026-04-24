# AGENTS.md

These instructions apply to the whole repository.

## Language

- Use Australian/British English over US English.

## Frontend

- Prefer Server Components by default. Only add `"use client"` when the component needs browser-only APIs, state/effects, event handlers, or client-only libraries.
- When touching JS/JSX components, convert them to TS/TSX when it is reasonable and scoped to the change.
- Keep shared presentational components server-safe where possible. For translated labels or suffixes, prefer passing translated text from the caller instead of adding `useTranslations` to a shared component.
- For React form submit handlers, use the shared `FormSubmitEvent` / `FormSubmitHandler` types from `src/types/events.ts`, which wrap React 19's `SubmitEvent`. Avoid deprecated `FormEvent`, `FormEventHandler`, and `React.FormEvent`; keep `ChangeEvent` for input/select/textarea change handlers.
- In MDX prose, if an inline component inside a Markdown list item is formatted onto multiple lines and changes rendered spacing, use a targeted `{/* prettier-ignore */}` before that list rather than disabling formatting for the whole file.

## Testing

- Add or update Playwright e2e coverage when changing important user flows such as auth, listings, locale switching, chat, or other multi-step interactions.
- Prefer resilient, locale-safe selectors in e2e tests. Use stable `data-testid` hooks for interactive controls when role-, text-, or structure-based selectors would be brittle across locales or UI refactors.
- When verifying end-to-end behaviour locally, prefer the production Playwright path (`npm run test:e2e:prod`) for app-flow confidence; dev-server runs are still useful, but can produce noise from HMR or other development-only behaviour.

## Internationalisation

- Put user-facing app UI copy in `next-intl` message files under `messages/`.
- Treat `messages/en.json` as the source catalogue. Keep Spanish (`es`) and German (`de`) complete whenever adding or changing message keys.
- Run `npm run i18n:check` after editing messages. Run `npm run check` before handing work back.
- Do not put dynamic user-generated content, internal enum values, table names, route constants, CSS strings, logs, or analytics identifiers into message files.
- For listing types and other enums, pass stable keys such as `business`, `community`, or `residential` and handle display grammar in translations, usually with ICU `select`.

## Supabase

- Treat `supabase/migrations/` as append-only once a migration has landed on any shared environment.
- Do not edit an existing historical migration to change live schema behaviour on staging or production. That only affects fresh or reset environments.
- When changing database schema, functions, views, policies, triggers, or grants, add a new forward migration instead.
- If a previous migration introduced the object you need to change, use a new migration with `create or replace`, `alter`, or the appropriate forward-only SQL rather than modifying the old file.
- If you are unsure whether a migration has already been applied anywhere shared, assume that it has and create a new migration.
