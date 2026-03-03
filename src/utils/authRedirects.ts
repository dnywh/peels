export const SUPABASE_EMAIL_AUTH_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const);

export type SupabaseEmailAuthType =
  (typeof SUPABASE_EMAIL_AUTH_TYPES extends Set<infer T> ? T : never) & string;

export const isSupportedEmailAuthType = (
  type: string | null | undefined
): type is SupabaseEmailAuthType =>
  typeof type === "string" &&
  SUPABASE_EMAIL_AUTH_TYPES.has(type as SupabaseEmailAuthType);

export const getDefaultNextPathByType = (type: string | null | undefined) => {
  if (type === "recovery") {
    return "/profile/reset-password";
  }

  return "/profile";
};

export const normalizeNextPath = (
  candidatePath: string | null | undefined,
  fallbackPath: string
) => {
  if (
    !candidatePath ||
    !candidatePath.startsWith("/") ||
    candidatePath.startsWith("//")
  ) {
    return fallbackPath;
  }

  try {
    const parsedPath = new URL(candidatePath, "https://www.peels.app");
    if (parsedPath.origin !== "https://www.peels.app") {
      return fallbackPath;
    }

    return `${parsedPath.pathname}${parsedPath.search}${parsedPath.hash}`;
  } catch (_error) {
    return fallbackPath;
  }
};

export const appendSuccessParam = (path: string, successValue: string) => {
  const normalizedPath = normalizeNextPath(path, "/profile");
  const url = new URL(normalizedPath, "https://www.peels.app");
  url.searchParams.set("success", successValue);
  return `${url.pathname}${url.search}${url.hash}`;
};
