import disposableDomains from "disposable-email-domains";

const DISPOSABLE_DOMAINS = new Set(
  (disposableDomains as string[]).map((d) => d.toLowerCase())
);

/** Domains observed in abuse or missing from the upstream package — keep short and reviewed */
const EXTRA_BLOCKED_EMAIL_DOMAINS = new Set(["merepost.com"]);

export function getEmailDomain(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export function isDisposableEmailDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  return DISPOSABLE_DOMAINS.has(d) || EXTRA_BLOCKED_EMAIL_DOMAINS.has(d);
}
