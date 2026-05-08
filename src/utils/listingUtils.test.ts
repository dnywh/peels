import test from "node:test";
import assert from "node:assert/strict";

import {
  generateListingDescription,
  generateListingJsonLd,
  generateListingMetadata,
} from "./listingUtils.ts";
import type { Listing } from "../types/listing.ts";

const communityListing = {
  id: 1,
  name: "Neighbourhood compost drop-off",
  description:
    "Households can subscribe to drop off their food scraps at a local community hub.",
  accepted_items: ["Food scraps"],
  rejected_items: [],
  photos: ["demo/community-garden.jpg"],
  links: [],
  type: "community",
  avatar: "demo/community-avatar.jpg",
  slug: "test-community-compost",
  coordinates: {
    latitude: -33.911,
    longitude: 151.1569,
  },
  country_code: "AU",
  area_name: "Marrickville",
  is_stub: false,
  owner_has_multiple_non_residential_listings: false,
} satisfies Listing;

test("listing metadata uses the listing name as the absolute title", () => {
  const metadata = generateListingMetadata(communityListing, null, {
    includeFullMetadata: true,
  });

  assert.deepEqual(metadata.title, {
    absolute: "Neighbourhood compost drop-off",
  });
  assert.equal(metadata.openGraph?.title, "Neighbourhood compost drop-off");
});

test("listing descriptions lead with compost and food-scrap intent", () => {
  const description = generateListingDescription(communityListing, null);

  assert.match(
    description,
    /^Neighbourhood compost drop-off helps people compost food scraps in Marrickville, Australia\./
  );
  assert.match(description, /local community hub/);
});

test("listing metadata includes the canonical listing path", () => {
  const metadata = generateListingMetadata(communityListing, null, {
    includeFullMetadata: true,
  });

  assert.equal(
    metadata.alternates?.canonical,
    "/listings/test-community-compost"
  );
});

test("residential public metadata avoids leaking host names", () => {
  const residentialListing = {
    ...communityListing,
    type: "residential",
    name: null,
    owner_first_name: "Sam",
    slug: "private-host",
  } satisfies Listing;

  const metadata = generateListingMetadata(residentialListing, null, {
    includeFullMetadata: true,
  });
  const description = String(metadata.description);

  assert.deepEqual(metadata.title, {
    absolute: "Private Host",
  });
  assert.match(description, /^Private Host accepts food scraps for composting/);
  assert.doesNotMatch(description, /Sam/);
});

test("listing JSON-LD describes the public listing page and place conservatively", () => {
  const jsonLd = generateListingJsonLd(communityListing, null);

  assert.ok(jsonLd);
  assert.equal(jsonLd["@type"], "WebPage");
  assert.equal(jsonLd.name, "Neighbourhood compost drop-off");
  assert.equal(
    jsonLd.url,
    "https://www.peels.app/listings/test-community-compost"
  );
  assert.equal(jsonLd.about["@type"], "Place");
  assert.ok(jsonLd.about.address);
  assert.equal(jsonLd.about.address.addressLocality, "Marrickville");
  assert.equal(jsonLd.about.address.addressCountry, "Australia");
});

test("anonymous residential listing JSON-LD omits structured location details", () => {
  const residentialListing = {
    ...communityListing,
    type: "residential",
    name: null,
    owner_first_name: "Sam",
    slug: "private-host",
  } satisfies Listing;

  const jsonLd = generateListingJsonLd(residentialListing, null);

  assert.ok(jsonLd);
  assert.equal(jsonLd.name, "Private Host");
  assert.equal(jsonLd.about.address, undefined);
  assert.equal(jsonLd.about.geo, undefined);
});

test("anonymous listing JSON-LD treats missing listing types as sensitive", () => {
  const unknownTypeListing = {
    ...communityListing,
    type: null,
    slug: "unknown-type-listing",
  } satisfies Listing;

  const jsonLd = generateListingJsonLd(unknownTypeListing, null);

  assert.ok(jsonLd);
  assert.equal(jsonLd.about.address, undefined);
  assert.equal(jsonLd.about.geo, undefined);
  assert.equal(jsonLd.about.image, undefined);
});
