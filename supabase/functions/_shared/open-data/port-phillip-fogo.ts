// City of Port Phillip communal FOGO bin mapper. See docs/open-data-listings.md.
// Programme rules: https://www.portphillip.vic.gov.au/council-services/waste-recycling-and-rubbish/dispose-of-your-food-and-garden-organics-fogo
import type { MappedOpenDataListing } from "./types.ts";

export const PORT_PHILLIP_FOGO_SOURCE_URL =
  "https://www.portphillip.vic.gov.au/council-services/waste-recycling-and-rubbish/communal-glass-recycling-and-fogo-recycling-hubs";

export const PORT_PHILLIP_STUB_PHOTOS = [
  "stubs/city-of-port-phillip-bins.jpg",
  "stubs/city-of-port-phillip-poster.jpg",
] as const;

export const PORT_PHILLIP_ACCEPTED_ITEMS = [
  "Fruit and vegetable scraps (including citrus and onion)",
  "Meat and seafood",
  "Bones (cooked and raw)",
  "Baked goods including bread and pastries",
  "Grains and cereal",
  "Mouldy and expired products",
  "Loose tea leaves and coffee grounds",
  "Grass clippings and weeds (free of soil)",
  "Garden prunings",
  "Leaves",
  "Lime green compostable caddy liners (AS 4736 and AS 5810)",
  "Small amounts of tissues, paper towel and shredded paper",
];

export const PORT_PHILLIP_REJECTED_ITEMS = [
  "Tea bags",
  "Coffee pods",
  "Pet waste and cat litter",
  "Compostable food packaging",
  "Liquids including cooking oil",
  "Soft plastics and plastic bags",
  "Soil",
  "Rocks and pebbles",
  "Plant pots",
  "Hard shellfish shells",
  "Rubber bands and string",
  "Bamboo cutlery",
  "Nappies",
];

export type PortPhillipFogoRecord = {
  externalId: string;
  siteName: string;
  streetNumber: string | null;
  streetName: string | null;
  suburb: string;
  latitude: number;
  longitude: number;
  collectionLocation: string | null;
  propertyType: string | null;
  fogoBinCount: number | null;
  fogoBinSize: string | null;
};

function asString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const raw = asString(value);
  if (!raw) {
    return null;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function labeledBlock(label: string, value: string | null): string | null {
  if (!value) {
    return null;
  }

  return `**${label}:**\n${value}`;
}

function buildDescription(record: PortPhillipFogoRecord): string {
  const streetParts = [record.streetNumber, record.streetName].filter(Boolean);
  const streetAddress = streetParts.length > 0 ? streetParts.join(" ") : null;

  return [
    labeledBlock("Address", streetAddress),
    labeledBlock("Suburb", record.suburb),
    labeledBlock("Collection location", record.collectionLocation),
    labeledBlock(
      "Notes",
      "Communal FOGO bins for residents and visitors in the City of Port Phillip area. Please use bins close to where you live, work, or are staying."
    ),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildPortPhillipExternalId(record: {
  siteName: string;
  collectionLocation: string | null;
  latitude: number;
  longitude: number;
}): string {
  const base = [
    slugify(record.siteName),
    slugify(record.collectionLocation ?? "default"),
    record.latitude.toFixed(5),
    record.longitude.toFixed(5),
  ].join("|");

  return base;
}

export function normalisePortPhillipSuburb(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Fix known council spreadsheet typos before we store or display text. */
export function normalisePortPhillipCouncilText(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  return value
    .replace(/\bexisitng\b/gi, "existing")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatPortPhillipStreetNumber(value: unknown): string | null {
  const raw = asString(value);
  return raw;
}

export function mapPortPhillipFogoRecord(
  input: Record<string, unknown>
): PortPhillipFogoRecord | null {
  const siteName = normalisePortPhillipCouncilText(
    asString(input.siteName ?? input.site_name)
  );
  const suburb = normalisePortPhillipSuburb(
    asString(input.suburb) ?? "Port Phillip"
  );
  const latitude = asNumber(input.latitude);
  const longitude = asNumber(input.longitude);
  const collectionLocation = normalisePortPhillipCouncilText(
    asString(input.collectionLocation ?? input.fogo_collection_location)
  );

  if (!siteName || latitude === null || longitude === null) {
    return null;
  }

  const externalId =
    asString(input.externalId ?? input.external_id) ??
    buildPortPhillipExternalId({
      siteName,
      collectionLocation,
      latitude,
      longitude,
    });

  return {
    externalId,
    siteName,
    streetNumber: formatPortPhillipStreetNumber(
      input.streetNumber ?? input.street_number
    ),
    streetName: normalisePortPhillipCouncilText(
      asString(input.streetName ?? input.street_name)
    ),
    suburb,
    latitude,
    longitude,
    collectionLocation,
    propertyType: asString(input.propertyType ?? input.property_type),
    fogoBinCount: asNumber(input.fogoBinCount ?? input.fogo_bins),
    fogoBinSize: asString(input.fogoBinSize ?? input.fogo_bin_size),
  };
}

export function mapPortPhillipFogoListing(
  record: PortPhillipFogoRecord
): MappedOpenDataListing {
  return {
    externalId: record.externalId,
    sourceVersion: null,
    name: record.siteName,
    description: buildDescription(record),
    latitude: record.latitude,
    longitude: record.longitude,
    areaName: record.suburb,
    countryCode: "AU",
    type: "community",
    acceptedItems: [...PORT_PHILLIP_ACCEPTED_ITEMS],
    rejectedItems: [...PORT_PHILLIP_REJECTED_ITEMS],
    links: [PORT_PHILLIP_FOGO_SOURCE_URL],
    isStub: true,
    visibility: true,
    useSourceAvatar: true,
  };
}

export function mapPortPhillipFogoRows(
  rows: Array<Record<string, unknown>>
): MappedOpenDataListing[] {
  const mapped: MappedOpenDataListing[] = [];

  for (const row of rows) {
    const record = mapPortPhillipFogoRecord(row);
    if (!record) {
      continue;
    }

    mapped.push(mapPortPhillipFogoListing(record));
  }

  return mapped;
}
