"use client";

import { useSyncExternalStore } from "react";

const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

type ProtomapsFlavorName = "light" | "dark";

function getPreferredMapFlavorSnapshot(): ProtomapsFlavorName {
  return window.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
}

function getServerPreferredMapFlavorSnapshot(): ProtomapsFlavorName {
  return "light";
}

function subscribeToPreferredMapFlavorChange(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(DARK_MODE_QUERY);

  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

export function usePreferredMapFlavor() {
  return useSyncExternalStore(
    subscribeToPreferredMapFlavorChange,
    getPreferredMapFlavorSnapshot,
    getServerPreferredMapFlavorSnapshot
  );
}
