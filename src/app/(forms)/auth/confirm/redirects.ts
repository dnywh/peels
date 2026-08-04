export function getInvalidLinkRedirectPath({
  authType,
  errorMessage,
  nextPath,
}: {
  authType: string | null;
  errorMessage: string;
  nextPath: string;
}) {
  const searchParams = new URLSearchParams({
    error: errorMessage,
  });

  if (authType === "recovery") {
    return `/forgot-password?${searchParams}`;
  }

  searchParams.set("redirect_to", nextPath);
  return `/sign-in?${searchParams}`;
}
