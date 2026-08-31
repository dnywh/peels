import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** demo-host profile id from supabase/seed.sql (local Stubs stand-in). */
export const LOCAL_DEMO_HOST_PROFILE_ID =
  "2c9ae20c-2469-4e60-84b3-39268697717c";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

export function readLocalSupabaseEnv() {
  const result = spawnSync("supabase", ["status", "-o", "env"], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0 || !result.stdout) {
    return {};
  }

  const values = {};
  for (const line of result.stdout.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)="([^"]*)"$/);
    if (match) {
      values[match[1]] = match[2];
    }
  }

  return values;
}

export function isLocalSupabaseUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "127.0.0.1" || hostname === "localhost";
  } catch {
    return false;
  }
}

export function resolveImportSupabaseCredentials(processEnv = process.env) {
  const localEnv = readLocalSupabaseEnv();

  return {
    supabaseUrl:
      processEnv.SUPABASE_URL ??
      processEnv.NEXT_PUBLIC_SUPABASE_URL ??
      localEnv.API_URL ??
      null,
    serviceRoleKey:
      processEnv.SUPABASE_SERVICE_ROLE_KEY ?? localEnv.SERVICE_ROLE_KEY ?? null,
    isLocal: isLocalSupabaseUrl(
      processEnv.SUPABASE_URL ??
        processEnv.NEXT_PUBLIC_SUPABASE_URL ??
        localEnv.API_URL ??
        ""
    ),
  };
}
