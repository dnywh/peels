const encodedReferrerPrefix = /^https?%(?:25)*3a%(?:25)*2f%(?:25)*2f/i;
const controlCharacters = /[\u0000-\u001f\u007f]/g;
const MAX_REFERRER_LENGTH = 512;

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

  return current.replace(controlCharacters, "").slice(0, MAX_REFERRER_LENGTH);
}

export function getSafeHttpReferrer(referrer: string | undefined) {
  const cleanedReferrer = normaliseReferrer(referrer)?.trim();

  if (!cleanedReferrer) return undefined;

  try {
    const referrerUrl = new URL(cleanedReferrer);

    if (!["http:", "https:"].includes(referrerUrl.protocol)) {
      return undefined;
    }

    referrerUrl.search = "";
    referrerUrl.hash = "";

    return referrerUrl.toString().slice(0, MAX_REFERRER_LENGTH);
  } catch {
    return undefined;
  }
}
