import type { ErrorEvent } from "react-map-gl/maplibre";

function isBenignMapResourceError(error: Error) {
  const message = error.message.toLowerCase();
  const isProtomapsTileError = message.includes("api.protomaps.com/tiles/");

  // MapLibre reports routine resource churn through `onError`: aborted tile
  // requests during pan/zoom and occasional Protomaps tile fetch blips. Those
  // can make the Next dev overlay look catastrophic even though the map
  // recovers on the next tile request.
  //
  // Keep this allow-list narrow so style/layer/rendering mistakes still reach
  // the console via `handleMapError`. In particular, do not suppress Safari's
  // generic "Load failed" message unless MapLibre includes the tile URL.
  if (error.name === "AbortError" || message === "aborterror") {
    return true;
  }

  if (
    error.name === "AJAXError" &&
    isProtomapsTileError &&
    (message.includes("failed to fetch") || message.includes("load failed"))
  ) {
    return true;
  }

  return false;
}

export function handleMapError(event: ErrorEvent) {
  if (isBenignMapResourceError(event.error)) {
    return;
  }

  console.error("Map rendering error:", event.error);
}
