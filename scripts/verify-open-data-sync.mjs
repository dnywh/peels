#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { hashMappedListing } from "../supabase/functions/_shared/open-data/hash.ts";
import { mapNycFeature } from "../supabase/functions/_shared/open-data/nyc-dsny.ts";

const supabaseUrl = process.env.SUPABASE_URL ?? "http://127.0.0.1:54331";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";
const ownerId =
  process.env.PEELS_OPEN_DATA_OWNER_ID_USA ??
  "2c9ae20c-2469-4e60-84b3-39268697717c";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const response = await fetch(
  "https://data.cityofnewyork.us/api/v3/views/if26-z6xq/query.geojson?$limit=5"
);
const payload = await response.json();
const features = payload.features ?? [];

if (features.length === 0) {
  throw new Error("Expected sample NYC features from open data API");
}

const mapped = mapNycFeature(features[0]);
if (!mapped) {
  throw new Error("Failed to map sample NYC feature");
}

const contentHash = await hashMappedListing(mapped);

const { data: listingId, error: upsertError } = await supabase.rpc(
  "upsert_open_data_listing",
  {
    p_listing_id: null,
    p_owner_id: ownerId,
    p_name: mapped.name,
    p_description: mapped.description,
    p_longitude: mapped.longitude,
    p_latitude: mapped.latitude,
    p_area_name: mapped.areaName,
    p_country_code: mapped.countryCode,
    p_accepted_items: mapped.acceptedItems,
    p_rejected_items: mapped.rejectedItems,
    p_links: mapped.links,
    p_type: mapped.type,
    p_is_stub: mapped.isStub,
    p_visibility: mapped.visibility,
  }
);

if (upsertError) {
  throw new Error(`upsert_open_data_listing failed: ${upsertError.message}`);
}

const { error: refError } = await supabase
  .from("listing_open_data_refs")
  .upsert(
    {
      feed_id: "nyc-dsny-food-scrap",
      external_id: mapped.externalId,
      listing_id: listingId,
      source_version: mapped.sourceVersion,
      content_hash: contentHash,
      sync_status: "active",
    },
    { onConflict: "feed_id,external_id" }
  );

if (refError) {
  throw new Error(`listing_open_data_refs upsert failed: ${refError.message}`);
}

const { data: publicListing, error: readError } = await supabase
  .from("public_listings")
  .select(
    "slug, is_stub, is_open_data_mirrored, accepted_items, rejected_items"
  )
  .eq("id", listingId)
  .single();

if (readError || !publicListing) {
  throw new Error(`public_listings read failed: ${readError?.message}`);
}

console.log(
  JSON.stringify(
    {
      sampleExternalId: mapped.externalId,
      listingId,
      slug: publicListing.slug,
      isStub: publicListing.is_stub,
      isOpenDataMirrored: publicListing.is_open_data_mirrored,
      acceptedItems: publicListing.accepted_items,
      rejectedItems: publicListing.rejected_items,
      remoteFeatureCountHint: "591 total in NYC feed",
    },
    null,
    2
  )
);

if (!publicListing.is_stub || !publicListing.is_open_data_mirrored) {
  throw new Error("Expected imported listing to be stub + open data mirrored");
}
