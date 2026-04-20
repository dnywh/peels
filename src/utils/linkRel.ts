// Centralises the rule for defaulting `rel` on `target="_blank"` anchors.
//
// We add `rel="noopener"` (not `noreferrer`) when a link opens in a new tab
// and the caller hasn't specified their own `rel`. `noopener` blocks the
// reverse-tabnabbing attack (`window.opener` access) while still sending the
// `Referer` header, so sites Peels links out to — Apple/Google Maps, podcast
// pages, listing owners' websites, etc. — can still see the traffic is
// coming from Peels.
//
// An explicit `rel` from the caller wins so per-link overrides
// (e.g. `sponsored`, `ugc`) still work.
export function resolveExternalRel(
  target: string | undefined,
  rel: string | undefined
): string | undefined {
  if (rel !== undefined) return rel;
  if (target === "_blank") return "noopener";
  return undefined;
}
