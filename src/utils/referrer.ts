export function normalizeReferrer(referrer: string): string;
export function normalizeReferrer(referrer: undefined): undefined;
export function normalizeReferrer(
  referrer: string | undefined
): string | undefined;
export function normalizeReferrer(referrer: string | undefined) {
  if (!referrer) return undefined;

  let current = referrer;

  for (let i = 0; i < 3; i += 1) {
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
