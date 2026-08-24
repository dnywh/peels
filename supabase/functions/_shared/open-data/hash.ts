import type { MappedOpenDataListing } from "./types.ts";

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

export async function hashMappedListing(
  listing: MappedOpenDataListing
): Promise<string> {
  const payload = {
    name: listing.name,
    description: listing.description,
    latitude: listing.latitude,
    longitude: listing.longitude,
    areaName: listing.areaName,
    countryCode: listing.countryCode,
    type: listing.type,
    acceptedItems: [...listing.acceptedItems].sort(),
    rejectedItems: [...listing.rejectedItems].sort(),
    links: [...listing.links].sort(),
    isStub: listing.isStub,
    visibility: listing.visibility,
  };

  const encoded = new TextEncoder().encode(stableStringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
