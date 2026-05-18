import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

function parseSupabaseStatusEnv() {
  const output = execFileSync("supabase", ["status", "-o", "env"], {
    encoding: "utf8",
  });

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((env, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) return env;

      const key = line.slice(0, separatorIndex);
      const value = line
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^"(.*)"$/, "$1");
      env[key] = value;
      return env;
    }, {});
}

function getServiceRoleKey(supabaseUrl: string) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  const hostname = new URL(supabaseUrl).hostname;
  const isLocal = hostname === "127.0.0.1" || hostname === "localhost";

  if (!isLocal) {
    return null;
  }

  try {
    return parseSupabaseStatusEnv().SERVICE_ROLE_KEY ?? null;
  } catch {
    return null;
  }
}

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  const serviceRoleKey = getServiceRoleKey(supabaseUrl);

  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
