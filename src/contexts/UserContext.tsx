"use client";

import { createContext, useContext } from "react";
import type { PropsWithChildren } from "react";

type UserContextValue = Record<string, unknown> | null;

export const UserContext = createContext<UserContextValue>(null);

export function UserProvider({
  user,
  children,
}: PropsWithChildren<{
  user: UserContextValue;
}>) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
