import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const buckets = ["avatars", "listing_avatars", "listing_photos"];
const args = new Set(process.argv.slice(2));
const shouldDeleteOrphans = args.has("--delete-orphans");
const confirmedOrphanDeletion = args.has("--confirm-delete-orphans");
const allowRemote = args.has("--allow-remote");
const beforeArg = process.argv.find((arg) => arg.startsWith("--before="));
const before = beforeArg
  ? new Date(beforeArg.slice("--before=".length))
  : new Date();

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
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    throw new Error(`Failed to list ${bucket}/${prefix}: ${error.message}`);
  }

  const objects = [];

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

  return objects;
}

async function getReferencedMedia(supabase) {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("avatar")
    .not("avatar", "is", null);

  if (profilesError) throw profilesError;

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("avatar, photos");

  if (listingsError) throw listingsError;

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

  return references;
}

function isBeforeCutoff(object) {
  const objectDate = object.createdAt || object.updatedAt;
  return !objectDate || objectDate <= before;
}

function isStoragePlaceholder(object) {
  return object.path.split("/").pop() === ".emptyFolderPlaceholder";
}

function formatObject(object) {
  const size = object.size === null ? "unknown size" : `${object.size} bytes`;
  const createdAt = object.createdAt?.toISOString() ?? "unknown created_at";
  return `${object.bucket}/${object.path} (${size}, ${createdAt})`;
}

async function main() {
  if (shouldDeleteOrphans && !confirmedOrphanDeletion) {
    throw new Error(
      "Refusing to delete orphans without --confirm-delete-orphans."
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
