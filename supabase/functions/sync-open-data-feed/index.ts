import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashMappedListing } from "../_shared/open-data/hash.ts";
import {
  mapNycFeature,
  parseNycGeoJson,
} from "../_shared/open-data/nyc-dsny.ts";
import type {
  ListingOpenDataRefRow,
  MappedOpenDataListing,
  OpenDataFeedRow,
  SyncStats,
} from "../_shared/open-data/types.ts";

function jsonResponse(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function resolveOwnerId(feedId: string): string | null {
  if (feedId.startsWith("nyc-")) {
    return Deno.env.get("PEELS_OPEN_DATA_OWNER_ID_USA") ?? null;
  }

  return Deno.env.get("PEELS_OPEN_DATA_OWNER_ID") ?? null;
}

async function fetchRemoteFeatures(
  feed: OpenDataFeedRow
): Promise<ReturnType<typeof parseNycGeoJson>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const appToken = Deno.env.get("PEELS_NYC_OPEN_DATA_APP_TOKEN");
  if (appToken) {
    headers["X-App-Token"] = appToken;
  }

  const response = await fetch(feed.api_url, { headers });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch open data feed (${response.status} ${response.statusText})`
    );
  }

  const payload = await response.json();

  if (feed.mapper_id.startsWith("nyc-dsny")) {
    return parseNycGeoJson(payload);
  }

  throw new Error(`Unsupported mapper_id: ${feed.mapper_id}`);
}

function mapFeature(
  feed: OpenDataFeedRow,
  feature: ReturnType<typeof parseNycGeoJson>[number]
): MappedOpenDataListing | null {
  if (feed.mapper_id.startsWith("nyc-dsny")) {
    return mapNycFeature(feature);
  }

  return null;
}

async function upsertListing(
  supabase: ReturnType<typeof createClient>,
  ownerId: string,
  listingId: number | null,
  mapped: MappedOpenDataListing
): Promise<number> {
  const { data, error } = await supabase.rpc("upsert_open_data_listing", {
    p_listing_id: listingId,
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
  });

  if (error) {
    throw new Error(`Failed to upsert listing: ${error.message}`);
  }

  return data as number;
}

const handler = async (request: Request): Promise<Response> => {
  try {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const syncSecret = Deno.env.get("PEELS_OPEN_DATA_SYNC_SECRET");
    if (!syncSecret) {
      throw new Error("Missing PEELS_OPEN_DATA_SYNC_SECRET");
    }

    if (request.headers.get("x-peels-webhook-secret") !== syncSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    let payload: { feed_id?: unknown };
    try {
      payload = await request.json();
    } catch (_error) {
      return jsonResponse({ error: "Invalid JSON request body" }, 400);
    }

    const feedId =
      typeof payload.feed_id === "string" ? payload.feed_id.trim() : "";
    if (!feedId) {
      return jsonResponse({ error: "Missing feed_id" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const ownerId = resolveOwnerId(feedId);
    if (!ownerId) {
      throw new Error(`Missing owner id env for feed ${feedId}`);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: feed, error: feedError } = await supabase
      .from("open_data_feeds")
      .select(
        "id, name, source_name, source_url, api_url, mapper_id, sync_cron, default_avatar"
      )
      .eq("id", feedId)
      .single();

    if (feedError || !feed) {
      throw new Error(`Feed not found: ${feedError?.message ?? feedId}`);
    }

    const syncStartedAt = new Date().toISOString();
    const stats: SyncStats = {
      fetched: 0,
      inserted: 0,
      updated: 0,
      unchanged: 0,
      removed: 0,
      skippedClaimed: 0,
      errors: 0,
    };

    const features = await fetchRemoteFeatures(feed as OpenDataFeedRow);
    stats.fetched = features.length;

    const { data: existingRefs, error: refsError } = await supabase
      .from("listing_open_data_refs")
      .select(
        "feed_id, external_id, listing_id, source_version, content_hash, last_seen_at, sync_status"
      )
      .eq("feed_id", feedId);

    if (refsError) {
      throw new Error(`Failed to load existing refs: ${refsError.message}`);
    }

    const refsByExternalId = new Map<string, ListingOpenDataRefRow>();
    for (const ref of existingRefs ?? []) {
      refsByExternalId.set(ref.external_id, ref as ListingOpenDataRefRow);
    }

    const seenExternalIds = new Set<string>();

    for (const feature of features) {
      try {
        const mapped = mapFeature(feed as OpenDataFeedRow, feature);
        if (!mapped) {
          stats.errors += 1;
          continue;
        }

        seenExternalIds.add(mapped.externalId);

        const contentHash = await hashMappedListing(mapped);
        const existingRef = refsByExternalId.get(mapped.externalId);

        if (existingRef?.sync_status === "claimed") {
          await supabase
            .from("listing_open_data_refs")
            .update({ last_seen_at: syncStartedAt })
            .eq("feed_id", feedId)
            .eq("external_id", mapped.externalId);
          stats.skippedClaimed += 1;
          continue;
        }

        if (existingRef && existingRef.content_hash === contentHash) {
          await supabase
            .from("listing_open_data_refs")
            .update({
              last_seen_at: syncStartedAt,
              source_version: mapped.sourceVersion,
            })
            .eq("feed_id", feedId)
            .eq("external_id", mapped.externalId);
          stats.unchanged += 1;
          continue;
        }

        const listingId = await upsertListing(
          supabase,
          ownerId,
          existingRef?.listing_id ?? null,
          mapped
        );

        if (feed.default_avatar) {
          const { error: avatarError } = await supabase
            .from("listings")
            .update({ avatar: feed.default_avatar })
            .eq("id", listingId);

          if (avatarError) {
            throw new Error(
              `Failed to set listing avatar: ${avatarError.message}`
            );
          }
        }

        const refPayload = {
          feed_id: feedId,
          external_id: mapped.externalId,
          listing_id: listingId,
          source_version: mapped.sourceVersion,
          content_hash: contentHash,
          last_seen_at: syncStartedAt,
          sync_status: "active",
        };

        const { error: refUpsertError } = await supabase
          .from("listing_open_data_refs")
          .upsert(refPayload, { onConflict: "feed_id,external_id" });

        if (refUpsertError) {
          throw new Error(`Failed to upsert ref: ${refUpsertError.message}`);
        }

        if (existingRef) {
          stats.updated += 1;
        } else {
          stats.inserted += 1;
        }
      } catch (error) {
        console.error("Failed to sync open data record", error);
        stats.errors += 1;
      }
    }

    for (const ref of existingRefs ?? []) {
      if (
        ref.sync_status !== "active" ||
        seenExternalIds.has(ref.external_id)
      ) {
        continue;
      }

      await supabase
        .from("listings")
        .update({ visibility: false })
        .eq("id", ref.listing_id);

      await supabase
        .from("listing_open_data_refs")
        .update({ sync_status: "removed_from_source" })
        .eq("feed_id", feedId)
        .eq("external_id", ref.external_id);

      stats.removed += 1;
    }

    const syncFinishedAt = new Date().toISOString();
    const syncStatus = stats.errors > 0 ? "completed_with_errors" : "completed";

    await supabase
      .from("open_data_feeds")
      .update({
        last_sync_at: syncFinishedAt,
        last_sync_status: syncStatus,
        last_sync_stats: stats,
      })
      .eq("id", feedId);

    return jsonResponse(
      {
        feed_id: feedId,
        status: syncStatus,
        stats,
      },
      200
    );
  } catch (error) {
    console.error("sync-open-data-feed failed", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};

serve(handler);
