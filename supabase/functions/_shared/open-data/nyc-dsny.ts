// NYC DSNY food scrap drop-off mapper. See docs/open-data-listings.md.
import type { MappedOpenDataListing } from "./types.ts";

export type NycGeoJsonFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  } | null;
  properties: Record<string, unknown>;
};

export type NycGeoJsonCollection = {
  type: "FeatureCollection";
  features: NycGeoJsonFeature[];
};

const DSNY_SMART_COMPOST_ACCEPTED = [
  "All food scraps",
  "Fruit and vegetable scraps",
  "Meat and dairy",
  "Coffee grounds and filters",
  "Tea bags",
  "Eggshells",
  "Bread and grains",
];

const DSNY_SMART_COMPOST_REJECTED = [
  "Non-food waste",
  "Plastic bags",
  "Leaving food scraps outside the bin",
];

const COMMUNITY_ACCEPTED = [
  "Fruit and vegetable scraps",
  "Coffee grounds and filters",
  "Tea bags",
  "Eggshells",
  "Bread and grains",
  "Houseplant trimmings",
];

const COMMUNITY_REJECTED = [
  "Meat",
  "Bones",
  "Dairy",
  "Oils and fats",
  "Plastic bags",
  "Non-food waste",
];

function asString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normaliseUrl(value: unknown): string | null {
  const raw = asString(value);
  if (!raw) {
    return null;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `https://${raw}`;
}

function extractAppUrl(value: unknown): string | null {
  if (typeof value === "string") {
    return normaliseUrl(value);
  }

  if (value && typeof value === "object" && "url" in value) {
    return normaliseUrl((value as { url?: unknown }).url);
  }

  return null;
}

function hasMeatDairyRestriction(notes: string | null): boolean {
  if (!notes) {
    return false;
  }

  return /no meat|meat, bones, or dairy|without meat/i.test(notes);
}

function isDsnySmartCompost(
  hostedBy: string | null,
  notes: string | null
): boolean {
  if (hostedBy === "Department of Sanitation") {
    return true;
  }

  return Boolean(notes && /smartcompost|download the app/i.test(notes));
}

function buildDescription(parts: Array<string | null>): string {
  return parts.filter(Boolean).join("\n\n");
}

function collectLinks(properties: Record<string, unknown>): string[] {
  const links = new Set<string>();

  for (const value of [
    normaliseUrl(properties.website),
    extractAppUrl(properties.app_ios),
    normaliseUrl(properties.app_android),
  ]) {
    if (value) {
      links.add(value);
    }
  }

  return [...links];
}

function resolveAcceptedRejected(
  hostedBy: string | null,
  notes: string | null
): { acceptedItems: string[]; rejectedItems: string[] } {
  if (isDsnySmartCompost(hostedBy, notes)) {
    return {
      acceptedItems: DSNY_SMART_COMPOST_ACCEPTED,
      rejectedItems: DSNY_SMART_COMPOST_REJECTED,
    };
  }

  if (hasMeatDairyRestriction(notes)) {
    return {
      acceptedItems: COMMUNITY_ACCEPTED,
      rejectedItems: COMMUNITY_REJECTED,
    };
  }

  return {
    acceptedItems: COMMUNITY_ACCEPTED,
    rejectedItems: COMMUNITY_REJECTED.filter((item) => item !== "Meat"),
  };
}

export function mapNycFeature(
  feature: NycGeoJsonFeature
): MappedOpenDataListing | null {
  const properties = feature.properties ?? {};
  const externalId = asString(properties.object_id);
  const name = asString(properties.food_scrap_drop_off_site);
  const hostedBy = asString(properties.hosted_by);
  const location = asString(properties.location);
  const openMonths = asString(properties.open_months);
  const hours = asString(properties.operation_day_hours);
  const notes = asString(properties.notes);
  const borough = asString(properties.borough);
  const neighbourhood = asString(properties.ntaname);

  let longitude: number | null = null;
  let latitude: number | null = null;

  if (
    feature.geometry?.type === "Point" &&
    Array.isArray(feature.geometry.coordinates) &&
    feature.geometry.coordinates.length >= 2
  ) {
    longitude = feature.geometry.coordinates[0];
    latitude = feature.geometry.coordinates[1];
  } else {
    const latText = asString(properties.latitude);
    const lngText = asString(properties.longitude);
    if (latText && lngText) {
      latitude = Number.parseFloat(latText);
      longitude = Number.parseFloat(lngText);
    }
  }

  if (
    !externalId ||
    !name ||
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  const { acceptedItems, rejectedItems } = resolveAcceptedRejected(
    hostedBy,
    notes
  );

  const description = buildDescription([
    location ? `Location: ${location}` : null,
    hostedBy ? `Hosted by: ${hostedBy}` : null,
    openMonths ? `Open: ${openMonths}` : null,
    hours ? `Hours: ${hours}` : null,
    notes,
  ]);

  return {
    externalId,
    sourceVersion: asString(properties[":version"]),
    name,
    description,
    latitude,
    longitude,
    areaName: borough ?? neighbourhood ?? "New York City",
    countryCode: "US",
    type: "community",
    acceptedItems,
    rejectedItems,
    links: collectLinks(properties),
    isStub: true,
    visibility: true,
  };
}

export function parseNycGeoJson(payload: unknown): NycGeoJsonFeature[] {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("features" in payload) ||
    !Array.isArray((payload as NycGeoJsonCollection).features)
  ) {
    throw new Error("Expected GeoJSON FeatureCollection with features array");
  }

  return (payload as NycGeoJsonCollection).features;
}
