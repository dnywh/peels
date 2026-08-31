import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPortPhillipExternalId,
  mapPortPhillipFogoListing,
  mapPortPhillipFogoRecord,
  normalisePortPhillipCouncilText,
} from "../../../supabase/functions/_shared/open-data/port-phillip-fogo.ts";

const sampleRecord = {
  siteName: "Little Finlay Reserve",
  streetNumber: "9",
  streetName: "Little Finlay St",
  suburb: "Albert Park",
  latitude: -37.84451,
  longitude: 144.9537,
  collectionLocation: "Moubray Lane Side",
  propertyType: "Communal",
  fogoBinCount: 2,
  fogoBinSize: "120L",
};

test("mapPortPhillipFogoRecord maps communal FOGO rows and omits glass-only data", () => {
  const mapped = mapPortPhillipFogoRecord({
    site_name: sampleRecord.siteName,
    street_number: sampleRecord.streetNumber,
    street_name: sampleRecord.streetName,
    suburb: sampleRecord.suburb,
    latitude: sampleRecord.latitude,
    longitude: sampleRecord.longitude,
    fogo_collection_location: sampleRecord.collectionLocation,
    property_type: sampleRecord.propertyType,
    fogo_bins: sampleRecord.fogoBinCount,
    fogo_bin_size: sampleRecord.fogoBinSize,
  });

  assert.ok(mapped);
  assert.equal(
    mapped.externalId,
    buildPortPhillipExternalId({
      siteName: sampleRecord.siteName,
      collectionLocation: sampleRecord.collectionLocation,
      latitude: sampleRecord.latitude,
      longitude: sampleRecord.longitude,
    })
  );
});

test("normalisePortPhillipCouncilText fixes known council typos", () => {
  assert.equal(
    normalisePortPhillipCouncilText(
      "Near playground & exisitng bin in surround"
    ),
    "Near playground & existing bin in surround"
  );
});

test("mapPortPhillipFogoListing builds About blocks and FOGO programme chips", () => {
  const record = mapPortPhillipFogoRecord({
    site_name: sampleRecord.siteName,
    street_number: sampleRecord.streetNumber,
    street_name: sampleRecord.streetName,
    suburb: sampleRecord.suburb,
    latitude: sampleRecord.latitude,
    longitude: sampleRecord.longitude,
    fogo_collection_location: sampleRecord.collectionLocation,
  });
  assert.ok(record);

  const listing = mapPortPhillipFogoListing(record);

  assert.equal(listing.name, "Little Finlay Reserve");
  assert.equal(listing.areaName, "Albert Park");
  assert.equal(listing.countryCode, "AU");
  assert.equal(listing.useSourceAvatar, true);
  assert.match(
    listing.description,
    /\*\*Address:\*\*\n9 Little Finlay St,\nAlbert Park/
  );
  assert.doesNotMatch(listing.description, /\*\*Suburb:\*\*/);
  assert.match(
    listing.description,
    /\*\*Collection location:\*\*\nMoubray Lane Side/
  );
  assert.match(
    listing.description,
    /residents and visitors in the City of Port Phillip/
  );
  assert.ok(listing.acceptedItems.includes("Meat and seafood"));
  assert.ok(listing.rejectedItems.includes("Tea bags"));
  assert.ok(
    listing.links[0]?.includes(
      "communal-glass-recycling-and-fogo-recycling-hubs"
    )
  );
});
