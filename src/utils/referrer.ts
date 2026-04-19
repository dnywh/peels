const encodedReferrerPrefix = /^https?%(?:25)*3a%(?:25)*2f%(?:25)*2f/i;

export function normaliseReferrer(referrer: string): string;
export function normaliseReferrer(referrer: undefined): undefined;
export function normaliseReferrer(
  referrer: string | undefined
): string | undefined;
export function normaliseReferrer(referrer: string | undefined) {
  if (referrer === undefined) return undefined;

  let current = referrer;

  for (let i = 0; i < 3 && encodedReferrerPrefix.test(current); i += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) break;
      current = decoded;
    } catch {
      break;
    }
  }

  return current;
}
