export function resolveOpenDataOwnerId(sourceId: string): string | null {
  if (sourceId.startsWith("nyc-")) {
    return Deno.env.get("PEELS_OPEN_DATA_OWNER_ID_USA") ?? null;
  }

  if (sourceId.startsWith("au-") || sourceId.includes("port-phillip")) {
    return (
      Deno.env.get("PEELS_OPEN_DATA_OWNER_ID_AU") ??
      Deno.env.get("PEELS_OPEN_DATA_OWNER_ID") ??
      null
    );
  }

  return Deno.env.get("PEELS_OPEN_DATA_OWNER_ID") ?? null;
}

export function resolveOpenDataOwnerIdFromProcessEnv(
  sourceId: string,
  env: Record<string, string | undefined>
): string | null {
  if (sourceId.startsWith("nyc-")) {
    return env.PEELS_OPEN_DATA_OWNER_ID_USA ?? null;
  }

  if (sourceId.startsWith("au-") || sourceId.includes("port-phillip")) {
    return (
      env.PEELS_OPEN_DATA_OWNER_ID_AU ?? env.PEELS_OPEN_DATA_OWNER_ID ?? null
    );
  }

  return env.PEELS_OPEN_DATA_OWNER_ID ?? null;
}
