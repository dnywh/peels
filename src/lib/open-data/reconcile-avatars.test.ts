import test from "node:test";
import assert from "node:assert/strict";

import {
  chunkListingIds,
  groupOpenDataAvatarIntents,
  OPEN_DATA_AVATAR_BATCH_SIZE,
} from "../../../supabase/functions/_shared/open-data/reconcile-avatars.ts";

test("groupOpenDataAvatarIntents splits apply and clear lists", () => {
  const grouped = groupOpenDataAvatarIntents([
    { listingId: 1, useSourceAvatar: true },
    { listingId: 2, useSourceAvatar: false },
    { listingId: 3, useSourceAvatar: true },
  ]);

  assert.deepEqual(grouped.applyAvatarListingIds, [1, 3]);
  assert.deepEqual(grouped.clearSourceAvatarListingIds, [2]);
});

test("chunkListingIds splits ids into fixed-size batches", () => {
  const ids = Array.from(
    { length: OPEN_DATA_AVATAR_BATCH_SIZE + 1 },
    (_, i) => i + 1
  );
  const chunks = chunkListingIds(ids, OPEN_DATA_AVATAR_BATCH_SIZE);

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0]?.length, OPEN_DATA_AVATAR_BATCH_SIZE);
  assert.deepEqual(chunks[1], [OPEN_DATA_AVATAR_BATCH_SIZE + 1]);
});
