// NYC DSNY food scrap drop-off mapper. See docs/open-data-listings.md.
// Programme rules: https://www.nyc.gov/site/dsny/collection/residents/food-scrap-drop-off.page
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

const SMART_COMPOST_ACCEPTED = [
  "Fruits and vegetables",
  "Eggshells",
  "Coffee grounds and tea bags",
  "Bread, rice, and pasta",
  "Meat, fish, bones, and dairy",
  "Prepared food",
  "Food-soiled paper",
  "Greasy uncoated paper plates and pizza boxes",
  "Houseplants and flowers",
  "Leaf and yard waste",
];

const SMART_COMPOST_REJECTED = [
  "Trash, wrappers, and hygiene products",
  "Pet waste, medical waste, and diapers",
  "Metal, glass, plastic, and cartons",
  "Clean paper and cardboard",
];

const COMMUNITY_DROP_OFF_ACCEPTED = [
  "Fruits and vegetables",
  "Eggshells",
  "Coffee grounds and tea bags",
  "Bread, rice, and pasta",
  "Leaf and yard waste",
  "Houseplants",
];

const COMMUNITY_DROP_OFF_REJECTED = [
  "Meat",
  "Fish",
  "Bones",
  "Dairy",
  "Oil and fat",
  "Prepared food",
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

function isDsnySmartCompost(hostedBy: string | null): boolean {
  return hostedBy === "Department of Sanitation";
}

function labeledBlock(label: string, value: string | null): string | null {
  if (!value) {
    return null;
  }

  return `**${label}:**\n${value}`;
}

function buildDescription(parts: Array<string | null>): string {
  return parts.filter(Boolean).join("\n\n");
}

function collectLinks(properties: Record<string, unknown>): string[] {
  const website = normaliseUrl(properties.website);
  return website ? [website] : [];
}

function resolveAcceptedRejected(hostedBy: string | null): {
  acceptedItems: string[];
  rejectedItems: string[];
} {
  if (isDsnySmartCompost(hostedBy)) {
    return {
      acceptedItems: SMART_COMPOST_ACCEPTED,
      rejectedItems: SMART_COMPOST_REJECTED,
    };
  }

  return {
    acceptedItems: COMMUNITY_DROP_OFF_ACCEPTED,
    rejectedItems: COMMUNITY_DROP_OFF_REJECTED,
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

  const { acceptedItems, rejectedItems } = resolveAcceptedRejected(hostedBy);

  const description = buildDescription([
    labeledBlock("Location", location),
    labeledBlock("Hosted by", hostedBy),
    labeledBlock("Open", openMonths),
    labeledBlock("Hours", hours),
    labeledBlock("Notes", notes),
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
