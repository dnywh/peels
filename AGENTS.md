# AGENTS.md

These instructions apply to the whole repository.

## Language

- Use Australian/British English over US English.

## Frontend

- Prefer Server Components by default. Only add `"use client"` when the component needs browser-only APIs, state/effects, event handlers, or client-only libraries.
- When touching JS/JSX components, convert them to TS/TSX when it is reasonable and scoped to the change.
- Keep shared presentational components server-safe where possible. For translated labels or suffixes, prefer passing translated text from the caller instead of adding `useTranslations` to a shared component.
- In MDX prose, if an inline component inside a Markdown list item is formatted onto multiple lines and changes rendered spacing, use a targeted `{/* prettier-ignore */}` before that list rather than disabling formatting for the whole file.

## Internationalisation

- Put user-facing app UI copy in `next-intl` message files under `messages/`.
- Treat `messages/en.json` as the source catalogue. Keep Spanish (`es`) and German (`de`) complete whenever adding or changing message keys.
- Run `npm run i18n:check` after editing messages. Run `npm run check` before handing work back.
- Do not put dynamic user-generated content, internal enum values, table names, route constants, CSS strings, logs, or analytics identifiers into message files.
- For listing types and other enums, pass stable keys such as `business`, `community`, or `residential` and handle display grammar in translations, usually with ICU `select`.
