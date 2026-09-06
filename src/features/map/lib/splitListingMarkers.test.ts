import assert from "node:assert/strict";
import test from "node:test";

import {
  excludeListingById,
  findListingMarkerById,
  mirroredListingsToGeoJson,
  resolveOrganicPinListings,
  splitListingMarkers,
} from "./splitListingMarkers.ts";
import type { ListingMarker } from "../../../types/listing.ts";

const organicListing: ListingMarker = {
  id: 1,
  slug: "organic-1",
  type: "residential",
  coordinates: { latitude: -37.81, longitude: 144.96 },
  is_open_data_mirrored: false,
};

const mirroredListing: ListingMarker = {
  id: 2,
  slug: "mirrored-1",
  type: "community",
  coordinates: { latitude: -37.82, longitude: 144.97 },
  is_open_data_mirrored: true,
};

test("splitListingMarkers separates mirrored and organic listings", () => {
  const result = splitListingMarkers([organicListing, mirroredListing]);

  assert.deepEqual(result.organic, [organicListing]);
  assert.deepEqual(result.mirrored, [mirroredListing]);
});

test("mirroredListingsToGeoJson builds point features", () => {
  const geoJson = mirroredListingsToGeoJson([mirroredListing]);

  assert.equal(geoJson.features.length, 1);
  assert.deepEqual(geoJson.features[0]?.geometry.coordinates, [144.97, -37.82]);
});

test("excludeListingById removes the selected mirrored listing", () => {
  const filtered = excludeListingById(
    [organicListing, mirroredListing],
    mirroredListing.id
  );

  assert.deepEqual(filtered, [organicListing]);
});

test("findListingMarkerById returns a matching marker", () => {
  assert.deepEqual(
    findListingMarkerById(
      [organicListing, mirroredListing],
      mirroredListing.id
    ),
    mirroredListing
  );
});

test("resolveOrganicPinListings keeps organic listings unchanged for organic selection", () => {
  const organicPins = resolveOrganicPinListings(
    [organicListing],
    organicListing,
    null
  );

  assert.deepEqual(organicPins, [organicListing]);
});

test("resolveOrganicPinListings lifts a selected mirrored listing into the organic layer", () => {
  const organicPins = resolveOrganicPinListings(
    [organicListing],
    mirroredListing,
    mirroredListing.id
  );

  assert.deepEqual(organicPins, [organicListing, mirroredListing]);
});
