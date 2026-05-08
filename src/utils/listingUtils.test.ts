import test from "node:test";
import assert from "node:assert/strict";

import {
  generateListingDescription,
  generateListingJsonLd,
  generateListingMetadata,
} from "./listingUtils.ts";
import type { Listing } from "../types/listing.ts";
import type { ListingSeoCopy } from "./listingUtils.ts";

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

const localisedSeoCopies = {
  es: {
    privateHostName: "Anfitrión privado",
    fallbackListingName: "Anuncio",
    residentialConnectName: "esta persona",
    residentialIntro: ({ name, location }) =>
      `${name} acepta restos de comida para compostar${location ? ` en ${location}` : ""}.`,
    nonResidentialIntro: ({ name, location }) =>
      `${name} ayuda a compostar restos de comida${location ? ` en ${location}` : ""}.`,
    connect: ({ name, siteName, explainer }) =>
      `Contacta con ${name} en ${siteName}, ${explainer}.`,
    locationKeywords: ({ location }) => [
      location,
      `restos de comida en ${location}`,
      `compostaje en ${location}`,
      `entrega de restos de comida en ${location}`,
      `punto de compostaje en ${location}`,
    ],
    baseKeywords: () => [
      "residuos orgánicos",
      "restos de comida",
      "compostaje",
    ],
  },
  de: {
    privateHostName: "Privater Host",
    fallbackListingName: "Eintrag",
    residentialConnectName: "dieser Person",
    residentialIntro: ({ name, location }) =>
      `${name} nimmt Lebensmittelreste zum Kompostieren${location ? ` in ${location}` : ""} an.`,
    nonResidentialIntro: ({ name, location }) =>
      `${name} hilft Menschen, Lebensmittelreste${location ? ` in ${location}` : ""} zu kompostieren.`,
    connect: ({ name, siteName, explainer }) =>
      `Verbinde dich mit ${name} auf ${siteName}, ${explainer}.`,
    locationKeywords: ({ location }) => [
      location,
      `Lebensmittelreste in ${location}`,
      `Kompost in ${location}`,
    ],
    baseKeywords: () => ["Lebensmittelreste", "Kompostierung"],
  },
  "pt-BR": {
    privateHostName: "Anfitrião privado",
    fallbackListingName: "Anúncio",
    residentialConnectName: "essa pessoa",
    residentialIntro: ({ name, location }) =>
      `${name} aceita restos de comida para compostagem${location ? ` em ${location}` : ""}.`,
    nonResidentialIntro: ({ name, location }) =>
      `${name} ajuda pessoas a compostar restos de comida${location ? ` em ${location}` : ""}.`,
    connect: ({ name, siteName, explainer }) =>
      `Entre em contato com ${name} pelo ${siteName}, ${explainer}.`,
    locationKeywords: ({ location }) => [
      location,
      `restos de comida em ${location}`,
      `compostagem em ${location}`,
    ],
    baseKeywords: () => ["resíduos orgânicos", "compostagem"],
  },
  fr: {
    privateHostName: "Hôte privé",
    fallbackListingName: "Annonce",
    residentialConnectName: "cette personne",
    residentialIntro: ({ name, location }) =>
      `${name} accepte les restes alimentaires pour le compostage${location ? ` à ${location}` : ""}.`,
    nonResidentialIntro: ({ name, location }) =>
      `${name} aide les gens à composter leurs restes alimentaires${location ? ` à ${location}` : ""}.`,
    connect: ({ name, siteName, explainer }) =>
      `Contactez ${name} sur ${siteName}, ${explainer}.`,
    locationKeywords: ({ location }) => [
      location,
      `restes alimentaires à ${location}`,
      `compostage à ${location}`,
    ],
    baseKeywords: () => ["déchets alimentaires", "compostage"],
  },
} satisfies Record<string, ListingSeoCopy>;

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

test("listing metadata can emit Spanish compost intent and keywords", () => {
  const spanishListing = {
    ...communityListing,
    country_code: "NZ",
    area_name: "Te Aro",
  } satisfies Listing;
  const metadata = generateListingMetadata(spanishListing, null, {
    includeFullMetadata: true,
    locale: "es",
    seoCopy: localisedSeoCopies.es,
  });

  assert.match(
    String(metadata.description),
    /^Neighbourhood compost drop-off ayuda a compostar restos de comida en Te Aro, Nueva Zelanda\./
  );

  assert.ok(Array.isArray(metadata.keywords));
  assert.ok(
    metadata.keywords.includes("restos de comida en Te Aro, Nueva Zelanda")
  );
  assert.ok(metadata.keywords.includes("residuos orgánicos"));
  assert.ok(!metadata.keywords.includes("food scraps"));
});

test("listing metadata supports every configured non-English SEO locale", () => {
  const expectedIntentByLocale = {
    es: "ayuda a compostar restos de comida",
    de: "hilft Menschen, Lebensmittelreste",
    "pt-BR": "ajuda pessoas a compostar restos de comida",
    fr: "aide les gens à composter leurs restes alimentaires",
  };

  for (const [locale, expectedIntent] of Object.entries(
    expectedIntentByLocale
  ) as Array<[keyof typeof localisedSeoCopies, string]>) {
    const metadata = generateListingMetadata(communityListing, null, {
      includeFullMetadata: true,
      locale,
      seoCopy: localisedSeoCopies[locale],
    });

    assert.match(String(metadata.description), new RegExp(expectedIntent));
    assert.ok(Array.isArray(metadata.keywords));
    assert.ok(metadata.keywords.length > 0);
  }
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
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: true,
  });
  assert.match(description, /^Private Host accepts food scraps for composting/);
  assert.doesNotMatch(description, /Sam/);
});

test("anonymous residential metadata avoids leaking listing names with localised SEO copy", () => {
  const residentialListing = {
    ...communityListing,
    type: "residential",
    name: "Sam's backyard bin",
    owner_first_name: "Sam",
    slug: "private-host",
  } satisfies Listing;

  const metadata = generateListingMetadata(residentialListing, null, {
    includeFullMetadata: true,
    locale: "es",
    seoCopy: localisedSeoCopies.es,
  });
  const description = String(metadata.description);

  assert.deepEqual(metadata.title, {
    absolute: "Anfitrión privado",
  });
  assert.match(
    description,
    /^Anfitrión privado acepta restos de comida para compostar/
  );
  assert.match(description, /Contacta con esta persona en Peels/);
  assert.doesNotMatch(description, /Sam/);
  assert.doesNotMatch(description, /backyard bin/);
});

test("authenticated residential metadata remains noindex", () => {
  const residentialListing = {
    ...communityListing,
    type: "residential",
    name: "Sam's backyard bin",
    owner_first_name: "Sam",
    slug: "private-host",
  } satisfies Listing;

  const metadata = generateListingMetadata(residentialListing, {
    id: "user-1",
  });

  assert.deepEqual(metadata.robots, {
    index: false,
    follow: true,
  });
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

test("listing JSON-LD can use localised descriptions, country names, and language", () => {
  const spanishListing = {
    ...communityListing,
    country_code: "NZ",
    area_name: "Te Aro",
  } satisfies Listing;
  const jsonLd = generateListingJsonLd(spanishListing, null, {
    locale: "es",
    seoCopy: localisedSeoCopies.es,
  });

  assert.ok(jsonLd);
  assert.equal(jsonLd.inLanguage, "es");
  assert.match(
    jsonLd.description,
    /^Neighbourhood compost drop-off ayuda a compostar restos de comida en Te Aro, Nueva Zelanda\./
  );
  assert.ok(jsonLd.about.address);
  assert.equal(jsonLd.about.address.addressCountry, "Nueva Zelanda");
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
