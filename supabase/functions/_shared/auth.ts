export function getBearerToken(
  authorizationHeader: string | null
): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const match = authorizationHeader.match(/^\s*Bearer\s+(.+?)\s*$/i);
  return match?.[1] ?? null;
}
