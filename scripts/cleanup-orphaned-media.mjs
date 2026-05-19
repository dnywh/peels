import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const buckets = ["avatars", "listing_avatars", "listing_photos"];
const databaseListPageSize = 1000;
const storageListPageSize = 1000;
const args = new Set(process.argv.slice(2));
const shouldDeleteOrphans = args.has("--delete-orphans");
const confirmedOrphanDeletion = args.has("--confirm-delete-orphans");
const allowRemote = args.has("--allow-remote");
const beforeArg = process.argv.find((arg) => arg.startsWith("--before="));
const hasExplicitBefore = Boolean(beforeArg);
const before = beforeArg
  ? new Date(beforeArg.slice("--before=".length))
  : new Date();
const pendingUploadProtectionMs = 24 * 60 * 60 * 1000;
const pendingUploadProtectedAfter = new Date(
  before.getTime() - pendingUploadProtectionMs
);

if (Number.isNaN(before.valueOf())) {
  throw new Error(
    "Invalid --before date. Use an ISO date, for example 2026-05-18."
  );
}

function parseStatusEnv() {
  const output = execFileSync("supabase", ["status", "-o", "env"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((env, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return env;

      const key = line.slice(0, separatorIndex);
      const rawValue = line.slice(separatorIndex + 1).trim();
      env[key] = rawValue.replace(/^"(.*)"$/, "$1");
      return env;
    }, {});
}

function getSupabaseEnv() {
  const configuredSupabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configuredServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (configuredSupabaseUrl && configuredServiceRoleKey) {
    return {
      serviceRoleKey: configuredServiceRoleKey,
      supabaseUrl: configuredSupabaseUrl,
    };
  }

  const statusEnv = parseStatusEnv();

  return {
    serviceRoleKey: configuredServiceRoleKey || statusEnv.SERVICE_ROLE_KEY,
    supabaseUrl: configuredSupabaseUrl || statusEnv.API_URL,
  };
}

function assertSafeTarget(supabaseUrl) {
  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL.");
  }

  const hostname = new URL(supabaseUrl).hostname;
  const isLocal = hostname === "127.0.0.1" || hostname === "localhost";

  if (!isLocal && !allowRemote) {
    throw new Error(
      "Refusing to clean up a remote Supabase project without --allow-remote."
    );
  }
}

async function listStorageObjects(supabase, bucket, prefix = "") {
  const objects = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: storageListPageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Failed to list ${bucket}/${prefix}: ${error.message}`);
    }

    for (const item of data ?? []) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;

      if (item.id === null) {
        objects.push(...(await listStorageObjects(supabase, bucket, itemPath)));
        continue;
      }

      objects.push({
        bucket,
        createdAt: item.created_at ? new Date(item.created_at) : null,
        path: itemPath,
        size: item.metadata?.size ?? null,
        updatedAt: item.updated_at ? new Date(item.updated_at) : null,
      });
    }

    if (!data || data.length < storageListPageSize) {
      break;
    }

    offset += data.length;
  }

  return objects;
}

async function selectAllRows({
  columns,
  configure,
  orderColumn,
  supabase,
  table,
}) {
  const rows = [];
  let offset = 0;

  while (true) {
    let query = supabase.from(table).select(columns);

    if (configure) {
      query = configure(query);
    }

    const { data, error } = await query
      .order(orderColumn, { ascending: true })
      .range(offset, offset + databaseListPageSize - 1);

    if (error) {
      throw new Error(`Failed to list ${table}: ${error.message}`);
    }

    rows.push(...(data ?? []));

    if (!data || data.length < databaseListPageSize) {
      break;
    }

    offset += data.length;
  }

  return rows;
}

async function getReferencedMedia(supabase) {
  const profiles = await selectAllRows({
    columns: "id, avatar",
    configure: (query) => query.not("avatar", "is", null),
    orderColumn: "id",
    supabase,
    table: "profiles",
  });
  const listings = await selectAllRows({
    columns: "id, avatar, photos",
    orderColumn: "id",
    supabase,
    table: "listings",
  });
  const pendingMediaUploads = await selectAllRows({
    columns: "id, bucket, path, created_at",
    configure: (query) =>
      query.gte("created_at", pendingUploadProtectedAfter.toISOString()),
    orderColumn: "id",
    supabase,
    table: "pending_media_uploads",
  });

  const references = new Set();

  for (const profile of profiles ?? []) {
    if (profile.avatar) {
      references.add(`avatars/${profile.avatar}`);
    }
  }

  for (const listing of listings ?? []) {
    if (listing.avatar) {
      references.add(`listing_avatars/${listing.avatar}`);
    }

    for (const photo of listing.photos ?? []) {
      references.add(`listing_photos/${photo}`);
    }
  }

  for (const upload of pendingMediaUploads ?? []) {
    if (upload.bucket && upload.path) {
      references.add(`${upload.bucket}/${upload.path}`);
    }
  }

  return references;
}

function isBeforeCutoff(object) {
  const objectDates = [object.createdAt, object.updatedAt].filter(Boolean);

  if (objectDates.length === 0) {
    return true;
  }

  const mostRecentObjectDate = new Date(
    Math.max(...objectDates.map((date) => date.getTime()))
  );

  return mostRecentObjectDate <= before;
}

function isStoragePlaceholder(object) {
  return object.path.split("/").pop() === ".emptyFolderPlaceholder";
}

function formatObject(object) {
  const size = object.size === null ? "unknown size" : `${object.size} bytes`;
  const createdAt = object.createdAt?.toISOString() ?? "unknown created_at";
  return `${object.bucket}/${object.path} (${size}, ${createdAt})`;
}

async function deletePendingMediaUploadRowsForObject(supabase, object) {
  if (
    object.bucket !== "listing_avatars" &&
    object.bucket !== "listing_photos"
  ) {
    return;
  }

  const { error } = await supabase
    .from("pending_media_uploads")
    .delete()
    .eq("bucket", object.bucket)
    .eq("path", object.path);

  if (error) throw error;
}

async function main() {
  if (shouldDeleteOrphans && !confirmedOrphanDeletion) {
    throw new Error(
      "Refusing to delete orphans without --confirm-delete-orphans."
    );
  }

  if (shouldDeleteOrphans && !hasExplicitBefore) {
    throw new Error(
      "Refusing to delete orphans without an explicit --before cutoff."
    );
  }

  const { serviceRoleKey, supabaseUrl } = getSupabaseEnv();
  assertSafeTarget(supabaseUrl);

  if (!serviceRoleKey) {
    throw new Error("Missing Supabase service role key.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const objects = (
    await Promise.all(
      buckets.map((bucket) => listStorageObjects(supabase, bucket))
    )
  ).flat();
  const referencedMedia = await getReferencedMedia(supabase);
  const orphanedObjects = objects
    .filter((object) => !isStoragePlaceholder(object))
    .filter((object) => !referencedMedia.has(`${object.bucket}/${object.path}`))
    .filter(isBeforeCutoff);

  console.log(`Orphaned media objects before ${before.toISOString()}:`);

  if (orphanedObjects.length === 0) {
    console.log("  none");
    return;
  }

  for (const object of orphanedObjects) {
    console.log(`  - ${formatObject(object)}`);
  }

  if (!shouldDeleteOrphans) {
    console.log(
      "\nDry run only. Re-run with --delete-orphans --confirm-delete-orphans to delete these files through the Storage API."
    );
    return;
  }

  for (const object of orphanedObjects) {
    await deletePendingMediaUploadRowsForObject(supabase, object);

    const { error } = await supabase.storage
      .from(object.bucket)
      .remove([object.path]);

    if (error) throw error;
    console.log(`Deleted ${object.bucket}/${object.path}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
