export function getChatThreadIdFromPathname(pathname: string) {
  return pathname.match(/\/chats\/([^/]+)/)?.[1] ?? null;
}
