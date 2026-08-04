const invalidLinkMessage =
  "Hmm, that sign-in link is invalid or has expired. Please request a new one.";

export function getInvalidLinkRedirectPath(nextPath: string) {
  const searchParams = new URLSearchParams({
    error: invalidLinkMessage,
    redirect_to: nextPath,
  });
  return `/sign-in?${searchParams}`;
}
