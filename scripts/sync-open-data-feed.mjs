#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const sourceId = process.argv[2] ?? "nyc-dsny-food-scrap";
const syncSecret = process.env.PEELS_OPEN_DATA_SYNC_SECRET;

if (!syncSecret) {
  console.error(
    "Missing PEELS_OPEN_DATA_SYNC_SECRET. Set it in your shell or supabase/functions/.env."
  );
  process.exit(1);
}

function readLocalFunctionsBaseUrl() {
  if (process.env.PEELS_FUNCTIONS_URL) {
    return process.env.PEELS_FUNCTIONS_URL.replace(/\/$/, "");
  }

  const result = spawnSync("supabase", ["status", "-o", "env"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status === 0 && result.stdout) {
    const match = result.stdout.match(/^FUNCTIONS_URL="([^"]+)"/m);
    if (match?.[1]) {
      return match[1].replace(/\/$/, "");
    }
  }

  return "http://127.0.0.1:54331/functions/v1";
}

const functionUrl = `${readLocalFunctionsBaseUrl()}/sync-open-data-feed`;

const response = await fetch(functionUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-peels-webhook-secret": syncSecret,
  },
  body: JSON.stringify({ source_id: sourceId }),
});

const bodyText = await response.text();
let body;
try {
  body = JSON.parse(bodyText);
} catch {
  body = bodyText;
}

if (!response.ok) {
  console.error(`Sync failed (${response.status} ${response.statusText})`);
  console.error(
    typeof body === "string" ? body : JSON.stringify(body, null, 2)
  );
  console.error("");
  console.error(`Called: ${functionUrl}`);
  console.error("");
  console.error("Checklist:");
  console.error("  1. supabase start is running (npm run supabase:status)");
  console.error(
    "  2. supabase/functions/.env has PEELS_OPEN_DATA_SYNC_SECRET and you restarted the stack after editing it"
  );
  process.exit(1);
}

console.log(typeof body === "string" ? body : JSON.stringify(body, null, 2));
