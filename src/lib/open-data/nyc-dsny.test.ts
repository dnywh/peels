import test from "node:test";
import assert from "node:assert/strict";

import {
  hashMappedListing,
  stableStringify,
} from "../../../supabase/functions/_shared/open-data/hash.ts";
import {
  mapNycFeature,
  type NycGeoJsonFeature,
} from "../../../supabase/functions/_shared/open-data/nyc-dsny.ts";

const dsnyFeature = {
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [-73.91427923, 40.69656438],
  },
  properties: {
    object_id: "75789",
    ":version": "rv-test",
    food_scrap_drop_off_site: "NE Bushwick Avenue & Halsey Street",
    location: "NE Bushwick Avenue & Halsey Street",
    hosted_by: "Department of Sanitation",
    open_months: "Year Round",
    operation_day_hours: "24/7",
    notes:
      "Download the app to access bins. Accepts all food scraps, including meat and dairy. Do not leave food scraps outside of bin!",
    website: "www.nyc.gov/smartcomposting",
    borough: "Brooklyn",
    ntaname: "Bushwick (East)",
    latitude: "40.69656438",
    longitude: "-73.91427923",
  },
} satisfies NycGeoJsonFeature;

const growNycFeature = {
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [-74.022767, 40.635514],
  },
  properties: {
    object_id: "76179",
    food_scrap_drop_off_site: "4th Avenue Presbyterian Church",
    location: "6753 4th Avenue, Brooklyn, NY 11220",
    hosted_by: "4th Avenue Presbyterian Church",
    open_months: "Year Round",
    operation_day_hours: "Every day (Start Time: Dawn - End Time: Dusk)",
    notes: "No meat, bones, or dairy.",
    borough: "Brooklyn",
    latitude: "40.635514",
    longitude: "-74.022767",
  },
} satisfies NycGeoJsonFeature;

test("stableStringify sorts object keys deterministically", () => {
  assert.equal(stableStringify({ b: 1, a: 2 }), '{"a":2,"b":1}');
});

test("mapNycFeature maps DSNY smart compost bins from the official programme page", () => {
  const mapped = mapNycFeature(dsnyFeature);

  assert.ok(mapped);
  assert.equal(mapped.externalId, "75789");
  assert.equal(mapped.areaName, "Brooklyn");
  assert.equal(mapped.countryCode, "US");
  assert.equal(mapped.type, "community");
  assert.deepEqual(mapped.links, ["https://www.nyc.gov/smartcomposting"]);
  assert.ok(mapped.acceptedItems.includes("Meat, fish, bones, and dairy"));
  assert.ok(mapped.acceptedItems.includes("Fruits and vegetables"));
  assert.ok(mapped.rejectedItems.includes("Clean paper and cardboard"));
  assert.equal(mapped.useSourceAvatar, true);
  assert.match(mapped.description, /^\*\*Location:\*\*\nNE Bushwick/);
  assert.match(mapped.description, /\n\*\*Hours:\*\*\n24\/7/);
  assert.match(mapped.description, /\n\*\*Notes:\*\*\nDownload the app/);
});

test("mapNycFeature maps community drop-off sites with DSNY community rules", () => {
  const mapped = mapNycFeature(growNycFeature);

  assert.ok(mapped);
  assert.deepEqual(mapped.links, []);
  assert.ok(mapped.acceptedItems.includes("Fruits and vegetables"));
  assert.ok(mapped.rejectedItems.includes("Meat"));
  assert.ok(mapped.rejectedItems.includes("Prepared food"));
  assert.equal(mapped.useSourceAvatar, false);
  assert.match(
    mapped.description,
    /\n\*\*Notes:\*\*\nNo meat, bones, or dairy\./
  );
});

test("hashMappedListing stays stable for unchanged mapped payloads", async () => {
  const mapped = mapNycFeature(dsnyFeature);
  assert.ok(mapped);

  const firstHash = await hashMappedListing(mapped);
  const secondHash = await hashMappedListing({ ...mapped });

  assert.equal(firstHash, secondHash);
});

test("hashMappedListing changes when mapped content changes", async () => {
  const mapped = mapNycFeature(dsnyFeature);
  assert.ok(mapped);

  const firstHash = await hashMappedListing(mapped);
  const secondHash = await hashMappedListing({
    ...mapped,
    description: `${mapped.description}\nUpdated`,
  });

  assert.notEqual(firstHash, secondHash);
});
