# Auth and Session Architecture

Peels keeps public pages fast by avoiding a server-side Supabase auth refresh unless a route actually needs auth before it can render. Public pages can still become auth-aware after hydration, but their first HTML response should be cheap, useful, and crawlable.

## Request Flow

`src/proxy.ts` decides whether a request needs a fresh server auth check.

- Auth-required paths use `updateSession()`. This creates a Supabase server client, calls `supabase.auth.getUser()`, refreshes cookies when needed, forwards `x-peels-auth-state`, and applies auth redirects for protected or guest-only pages.
- Public paths use `createSignedOutResponse()`. This forwards the current path and a signed-out auth hint without calling Supabase, so pages such as `/`, `/share`, and static content do not block first paint on auth.
- `authRequiredPathPrefixes` should stay small. Add to it only when the first server response truly needs auth state. `/map` and `/listings` belong there because they server-render auth-aware listing data before client hydration.

The forwarded auth state is a rendering hint. On public routes that do not need server auth, it intentionally says signed-out on the initial server render even if the browser has a valid session cookie. Client-side auth slots can then resolve the real state after hydration.

## Locale Behaviour

Public pages should use the locale cookie as the fast path. Signed-in profile-backed locale lookup belongs on authenticated/private flows where the server has already paid the auth cost.

If a signed-in user sees the wrong language on a public page, first check whether their locale cookie is stale or missing. Do not fix that by making every public request call `supabase.auth.getUser()`.

## Public Auth UI

Auth-aware UI on public pages should be isolated to small client components:

- `AccountButton` can resolve the current user after hydration.
- `FooterLocaleSlot` decides whether to show the guest language picker after client auth resolves.
- Unread chat dots can appear after the scoped unread check completes.

This means the first paint can briefly look signed-out on public pages. That is expected. The page should converge to the right signed-in or signed-out UI after hydration.

## Unread Chat State

`UnreadMessagesProvider` belongs near the UI that displays or consumes unread state, such as tab-bar and chat layouts. It should not wrap the root layout.

The unread check should stay deferred so it does not delay public HTML. If the unread dot disappears entirely, check the provider scope, the idle auth check, and the unread `chat_messages` count before moving the provider back to the root.

## Homepage First Paint

The homepage should server-render useful static content first, then hydrate dynamism later.

- `IntroHeader` reserves the hero visual space without server-rendering the decorative map/avatar/pin frame.
- `DeferredIntroHeaderRotator` loads the animated hero rotator after the first paint/idle window.
- `PeelsHowItWorks` keeps crawlable explanatory content in the initial HTML.
- Deferred demo components load map, listing, chat, and photo demos after intersection or idle.

Avoid importing production-heavy interactive components such as listing reads, map demos, or chat windows directly into the initial homepage path unless the performance tradeoff is intentional.

## Chat Route Data

Selected chat routes need auth, thread lists, selected-thread data, and metadata. Shared server lookups should go through the cached helpers in `src/features/chat/chatPageData.ts` so the layout, page, and `generateMetadata()` do not repeat the same Supabase work in one request.

## Debugging Checklist

- If guests can reach a protected page, check `authRequiredPathPrefixes`, `updateSession()`, and the route-level redirect assumptions.
- If a public page becomes slow, check that it was not added to `authRequiredPathPrefixes` and that no server component on that path now calls auth, `headers()`, or profile lookup unnecessarily.
- If footer locale behaviour looks wrong, inspect `FooterLocaleSlot` and `useAuthUser()`. Remember that the guest picker appears only after client auth resolves.
- If signed-in preferred locale is missing on a public first render, treat that as expected unless the locale cookie should have been updated.
- If unread dots are missing, check provider scope and the deferred unread lookup before broadening the provider.
- If selected chat pages duplicate Supabase calls, route shared work through `src/features/chat/chatPageData.ts`.

## Useful Checks

For auth/session, homepage, and chat changes, prefer production-style e2e checks:

```bash
npm run test:e2e:prod -- e2e/home.spec.ts e2e/chat.spec.ts e2e/i18n.spec.ts
```

Add `e2e/seo.spec.ts` when metadata, public routes, or crawlable content are affected.
