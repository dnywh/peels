#!/usr/bin/env -S node --experimental-strip-types

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

import { runOpenDataFileImport } from "../supabase/functions/_shared/open-data/import-file.ts";
import {
  PORT_PHILLIP_STUB_PHOTOS,
  mapPortPhillipFogoRows,
} from "../supabase/functions/_shared/open-data/port-phillip-fogo.ts";
import { resolveOpenDataOwnerIdFromProcessEnv } from "../supabase/functions/_shared/open-data/resolve-owner.ts";
import {
  LOCAL_DEMO_HOST_PROFILE_ID,
  resolveImportSupabaseCredentials,
} from "./lib/open-data-env.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

function readFunctionsEnvValue(name) {
  const envPath = path.join(repoRoot, "supabase", "functions", ".env");

  try {
    const contents = readFileSync(envPath, "utf8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (key === name && value.length > 0) {
        return value;
      }
    }
  } catch {
    // Optional local functions env.
  }

  return null;
}

function usage() {
  console.error(`Usage: npm run import:open-data -- <source-id> [sanitized.json] [--apply]

Defaults:
  sanitized.json -> data/open-data-sanitized/<source-id>.json

Without --apply, prints a dry-run summary only.
`);
}

function mapListingsForSource(sourceId, records) {
  if (sourceId === "port-phillip-fogo-communal") {
    return mapPortPhillipFogoRows(records);
  }

  throw new Error(`Unsupported source id: ${sourceId}`);
}

function defaultPhotosForSource(sourceId) {
  if (sourceId === "port-phillip-fogo-communal") {
    return [...PORT_PHILLIP_STUB_PHOTOS];
  }

  return undefined;
}

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const positional = args.filter((arg) => arg !== "--apply");
const sourceId = positional[0];

if (!sourceId) {
  usage();
  process.exit(1);
}

const sanitizedPath =
  positional[1] ??
  path.join(repoRoot, "data", "open-data-sanitized", `${sourceId}.json`);

const payload = JSON.parse(readFileSync(sanitizedPath, "utf8"));
const records = payload.records ?? payload;
const listings = mapListingsForSource(sourceId, records);

if (!apply) {
  console.log(
    JSON.stringify(
      {
        source_id: sourceId,
        sanitized_path: sanitizedPath,
        dry_run: true,
        fetched: listings.length,
        sample: listings.slice(0, 2).map((listing) => ({
          externalId: listing.externalId,
          name: listing.name,
          areaName: listing.areaName,
        })),
      },
      null,
      2
    )
  );
  process.exit(0);
}

const { supabaseUrl, serviceRoleKey, isLocal } =
  resolveImportSupabaseCredentials(process.env);

let ownerId =
  resolveOpenDataOwnerIdFromProcessEnv(sourceId, process.env) ??
  readFunctionsEnvValue(
    sourceId.startsWith("port-phillip-")
      ? "PEELS_OPEN_DATA_OWNER_ID_AU"
      : sourceId.startsWith("nyc-")
        ? "PEELS_OPEN_DATA_OWNER_ID_USA"
        : "PEELS_OPEN_DATA_OWNER_ID"
  );

if (!ownerId && isLocal) {
  ownerId = LOCAL_DEMO_HOST_PROFILE_ID;
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing Supabase credentials. Start the local stack (`supabase start`) or export SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production."
  );
  process.exit(1);
}

if (!ownerId) {
  console.error(
    `Missing owner id for ${sourceId}. For production set PEELS_OPEN_DATA_OWNER_ID_AU. Local Docker uses demo-host from seed.sql automatically when the stack is running.`
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: source, error: sourceError } = await supabase
  .from("open_data_sources")
  .select(
    "id, name, source_name, source_url, source_type, api_url, mapper_id, sync_cron, default_avatar, default_import_mode"
  )
  .eq("id", sourceId)
  .single();

if (sourceError || !source) {
  console.error(`Source not found: ${sourceError?.message ?? sourceId}`);
  process.exit(1);
}

const stats = await runOpenDataFileImport({
  supabase,
  source,
  ownerId,
  listings,
  defaultPhotos: defaultPhotosForSource(sourceId),
  dryRun: false,
});

console.log(
  JSON.stringify(
    {
      source_id: sourceId,
      status: stats.errors > 0 ? "completed_with_errors" : "completed",
      stats,
    },
    null,
    2
  )
);
