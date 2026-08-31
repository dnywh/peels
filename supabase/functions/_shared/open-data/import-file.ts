import type { SupabaseClient } from "@supabase/supabase-js";

import { hashMappedListing } from "./hash.ts";
import type {
  ListingOpenDataRefRow,
  MappedOpenDataListing,
  OpenDataSourceRow,
  SyncStats,
} from "./types.ts";

export type FileImportOptions = {
  supabase: SupabaseClient;
  source: OpenDataSourceRow;
  ownerId: string;
  listings: MappedOpenDataListing[];
  defaultPhotos?: string[];
  dryRun?: boolean;
};

function throwIfSupabaseError(
  error: { message: string } | null,
  context: string
) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

async function upsertListing(
  supabase: SupabaseClient,
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

async function reconcileListingMedia(
  supabase: SupabaseClient,
  source: OpenDataSourceRow,
  mapped: MappedOpenDataListing,
  listingId: number,
  defaultPhotos: string[] | undefined
) {
  const updates: {
    avatar?: string | null;
    photos?: string[];
  } = {};

  if (source.default_avatar) {
    updates.avatar = mapped.useSourceAvatar ? source.default_avatar : null;
  }

  if (defaultPhotos && defaultPhotos.length > 0) {
    updates.photos = defaultPhotos;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", listingId);

  if (error) {
    throw new Error(`Failed to reconcile listing media: ${error.message}`);
  }
}

export async function runOpenDataFileImport({
  supabase,
  source,
  ownerId,
  listings,
  defaultPhotos,
  dryRun = false,
}: FileImportOptions): Promise<SyncStats> {
  if (source.source_type === "api") {
    throw new Error(
      `Source ${source.id} is api-backed; use sync-open-data-feed instead`
    );
  }

  const syncStartedAt = new Date().toISOString();
  const stats: SyncStats = {
    fetched: listings.length,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    removed: 0,
    skippedClaimed: 0,
    errors: 0,
  };

  if (dryRun) {
    return stats;
  }

  const { data: existingRefs, error: refsError } = await supabase
    .from("listing_open_data_refs")
    .select(
      "source_id, external_id, listing_id, source_version, content_hash, last_seen_at, sync_status"
    )
    .eq("source_id", source.id);

  if (refsError) {
    throw new Error(`Failed to load existing refs: ${refsError.message}`);
  }

  const refsByExternalId = new Map<string, ListingOpenDataRefRow>();
  for (const ref of existingRefs ?? []) {
    refsByExternalId.set(ref.external_id, ref as ListingOpenDataRefRow);
  }

  const seenExternalIds = new Set<string>();

  for (const mapped of listings) {
    try {
      seenExternalIds.add(mapped.externalId);

      const contentHash = await hashMappedListing(mapped);
      const existingRef = refsByExternalId.get(mapped.externalId);

      if (existingRef?.sync_status === "claimed") {
        const { error: claimedRefError } = await supabase
          .from("listing_open_data_refs")
          .update({ last_seen_at: syncStartedAt })
          .eq("source_id", source.id)
          .eq("external_id", mapped.externalId);
        throwIfSupabaseError(
          claimedRefError,
          "Failed to touch claimed open data ref"
        );
        stats.skippedClaimed += 1;
        continue;
      }

      if (existingRef && existingRef.content_hash === contentHash) {
        const { error: unchangedRefError } = await supabase
          .from("listing_open_data_refs")
          .update({
            last_seen_at: syncStartedAt,
            source_version: mapped.sourceVersion,
          })
          .eq("source_id", source.id)
          .eq("external_id", mapped.externalId);
        throwIfSupabaseError(
          unchangedRefError,
          "Failed to touch unchanged open data ref"
        );
        await reconcileListingMedia(
          supabase,
          source,
          mapped,
          existingRef.listing_id,
          defaultPhotos
        );
        stats.unchanged += 1;
        continue;
      }

      const listingId = await upsertListing(
        supabase,
        ownerId,
        existingRef?.listing_id ?? null,
        mapped
      );

      await reconcileListingMedia(
        supabase,
        source,
        mapped,
        listingId,
        defaultPhotos
      );

      const refPayload = {
        source_id: source.id,
        external_id: mapped.externalId,
        listing_id: listingId,
        source_version: mapped.sourceVersion,
        content_hash: contentHash,
        last_seen_at: syncStartedAt,
        sync_status: "active",
      };

      const { error: refUpsertError } = await supabase
        .from("listing_open_data_refs")
        .upsert(refPayload, { onConflict: "source_id,external_id" });

      if (refUpsertError) {
        throw new Error(`Failed to upsert ref: ${refUpsertError.message}`);
      }

      if (existingRef) {
        stats.updated += 1;
      } else {
        stats.inserted += 1;
      }
    } catch (error) {
      console.error("Failed to import open data record", error);
      stats.errors += 1;
    }
  }

  if (source.default_import_mode === "complete_snapshot") {
    for (const ref of existingRefs ?? []) {
      if (
        ref.sync_status !== "active" ||
        seenExternalIds.has(ref.external_id)
      ) {
        continue;
      }

      const { error: hideListingError } = await supabase
        .from("listings")
        .update({ visibility: false })
        .eq("id", ref.listing_id);
      throwIfSupabaseError(
        hideListingError,
        `Failed to hide listing ${ref.listing_id}`
      );

      const { error: removeRefError } = await supabase
        .from("listing_open_data_refs")
        .update({ sync_status: "removed_from_source" })
        .eq("source_id", source.id)
        .eq("external_id", ref.external_id);
      throwIfSupabaseError(
        removeRefError,
        `Failed to mark ref ${ref.external_id} removed`
      );

      stats.removed += 1;
    }
  }

  const syncFinishedAt = new Date().toISOString();
  const syncStatus = stats.errors > 0 ? "completed_with_errors" : "completed";

  const { error: sourceSyncError } = await supabase
    .from("open_data_sources")
    .update({
      last_sync_at: syncFinishedAt,
      last_sync_status: syncStatus,
      last_sync_stats: stats,
    })
    .eq("id", source.id);
  throwIfSupabaseError(
    sourceSyncError,
    `Failed to update sync metadata for ${source.id}`
  );

  return stats;
}
