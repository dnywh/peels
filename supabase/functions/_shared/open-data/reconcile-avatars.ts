import type { SupabaseClient } from "@supabase/supabase-js";

import type { OpenDataSourceRow } from "./types.ts";

export type OpenDataAvatarIntent = {
  listingId: number;
  useSourceAvatar: boolean;
};

export const OPEN_DATA_AVATAR_BATCH_SIZE = 200;

export function chunkListingIds(
  listingIds: number[],
  batchSize = OPEN_DATA_AVATAR_BATCH_SIZE
): number[][] {
  const chunks: number[][] = [];

  for (let index = 0; index < listingIds.length; index += batchSize) {
    chunks.push(listingIds.slice(index, index + batchSize));
  }

  return chunks;
}

export function groupOpenDataAvatarIntents(intents: OpenDataAvatarIntent[]): {
  applyAvatarListingIds: number[];
  clearSourceAvatarListingIds: number[];
} {
  const applyAvatarListingIds: number[] = [];
  const clearSourceAvatarListingIds: number[] = [];

  for (const intent of intents) {
    if (intent.useSourceAvatar) {
      applyAvatarListingIds.push(intent.listingId);
    } else {
      clearSourceAvatarListingIds.push(intent.listingId);
    }
  }

  return { applyAvatarListingIds, clearSourceAvatarListingIds };
}

function throwIfSupabaseError(
  error: { message: string } | null,
  context: string
) {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
}

/** Batched avatar reconciliation for API sync runs (one pass per source). */
export async function reconcileOpenDataAvatarsInBatch(
  supabase: SupabaseClient,
  source: Pick<OpenDataSourceRow, "default_avatar">,
  intents: OpenDataAvatarIntent[]
) {
  const defaultAvatar = source.default_avatar;
  if (!defaultAvatar || intents.length === 0) {
    return;
  }

  const { applyAvatarListingIds, clearSourceAvatarListingIds } =
    groupOpenDataAvatarIntents(intents);

  for (const listingIds of chunkListingIds(applyAvatarListingIds)) {
    const { error } = await supabase
      .from("listings")
      .update({ avatar: defaultAvatar })
      .in("id", listingIds)
      .is("avatar", null);

    throwIfSupabaseError(
      error,
      "Failed to apply shared open data avatars in batch"
    );
  }

  for (const listingIds of chunkListingIds(clearSourceAvatarListingIds)) {
    const { error } = await supabase
      .from("listings")
      .update({ avatar: null })
      .in("id", listingIds)
      .eq("avatar", defaultAvatar);

    throwIfSupabaseError(
      error,
      "Failed to clear shared open data avatars in batch"
    );
  }
}
