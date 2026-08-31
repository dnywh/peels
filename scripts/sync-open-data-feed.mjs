#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const feedId = process.argv[2] ?? "nyc-dsny-food-scrap";
const syncSecret = process.env.PEELS_OPEN_DATA_SYNC_SECRET;

if (!syncSecret) {
  console.error(
    "Missing PEELS_OPEN_DATA_SYNC_SECRET. Set it in your shell before invoking the sync."
  );
  process.exit(1);
}

const result = spawnSync(
  "supabase",
  [
    "functions",
    "invoke",
    "sync-open-data-feed",
    "--body",
    JSON.stringify({ source_id: feedId }),
    "--header",
    `x-peels-webhook-secret: ${syncSecret}`,
  ],
  {
    stdio: "inherit",
    env: process.env,
  }
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
