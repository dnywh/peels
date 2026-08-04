export function getInvalidLinkRedirectPath({
  authType,
  errorMessage,
  locale,
  nextPath,
}: {
  authType: string | null;
  errorMessage: string;
  locale?: string | null;
  nextPath: string;
}) {
  const searchParams = new URLSearchParams({
    error: errorMessage,
  });

  if (authType === "recovery") {
    return `/forgot-password?${searchParams}`;
  }

  if (
    authType === "signup" ||
    authType === "email" ||
    authType === "magiclink" ||
    authType === "invite" ||
    authType === "email_change"
  ) {
    const retryType = authType === "email" ? "magiclink" : authType;
    searchParams.set("type", retryType);
    searchParams.set("next", nextPath);
    if (locale) searchParams.set("locale", locale);
    return `/auth/retry?${searchParams}`;
  }

  searchParams.set("redirect_to", nextPath);
  return `/sign-in?${searchParams}`;
}
