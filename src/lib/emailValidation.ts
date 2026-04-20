import disposableDomains from "disposable-email-domains";

// List is published from the upstream disposable blocklist; bump the package to pick up new domains.
const DISPOSABLE_DOMAINS = new Set(
  (disposableDomains as string[]).map((d) => d.toLowerCase())
);

export function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isDisposableEmailDomain(domain: string): boolean {
  return DISPOSABLE_DOMAINS.has(domain.toLowerCase());
}
