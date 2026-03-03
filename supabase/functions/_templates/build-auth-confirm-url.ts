type AuthEmailType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email"
  | "reauthentication";

const normalizeNextPath = (
  nextPath: string | null | undefined,
  fallbackPath: string
) => {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallbackPath;
  }

  try {
    const parsedPath = new URL(nextPath, "https://www.peels.app");
    if (parsedPath.origin !== "https://www.peels.app") {
      return fallbackPath;
    }
    return `${parsedPath.pathname}${parsedPath.search}${parsedPath.hash}`;
  } catch (_error) {
    return fallbackPath;
  }
};

const getDefaultNextPathByType = (type: AuthEmailType) =>
  type === "recovery" ? "/profile/reset-password" : "/profile";

export const buildAuthConfirmUrl = ({
  email,
  emailActionType,
  redirectTo,
  tokenHash,
}: {
  email?: string;
  emailActionType: string;
  redirectTo: string;
  tokenHash: string;
}) => {
  const typedAction = (emailActionType ?? "") as AuthEmailType;
  const safeAction: AuthEmailType =
    typedAction === "signup" ||
    typedAction === "invite" ||
    typedAction === "magiclink" ||
    typedAction === "recovery" ||
    typedAction === "email_change" ||
    typedAction === "email" ||
    typedAction === "reauthentication"
      ? typedAction
      : "magiclink";

  const fallbackNextPath = getDefaultNextPathByType(safeAction);
  let appOrigin = "https://www.peels.app";
  let nextPath = fallbackNextPath;

  if (redirectTo) {
    try {
      const redirectUrl = new URL(redirectTo);
      appOrigin = redirectUrl.origin;
      const candidateNextPath =
        redirectUrl.searchParams.get("next") ??
        redirectUrl.searchParams.get("redirect_to");

      if (candidateNextPath) {
        nextPath = normalizeNextPath(candidateNextPath, fallbackNextPath);
      }
    } catch (_error) {
      nextPath = fallbackNextPath;
    }
  }

  const confirmUrl = new URL("/auth/confirm", appOrigin);
  confirmUrl.searchParams.set("token_hash", tokenHash);
  confirmUrl.searchParams.set("type", safeAction);
  confirmUrl.searchParams.set("next", nextPath);
  if (email) {
    confirmUrl.searchParams.set("email", email);
  }

  return confirmUrl.toString();
};
