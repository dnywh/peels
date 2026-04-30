import type { ErrorEvent } from "react-map-gl/maplibre";

function isBenignMapResourceError(error: Error) {
  return (
    error.name === "AbortError" ||
    error.message === "AbortError" ||
    error.message === "Load failed"
  );
}

export function handleMapError(event: ErrorEvent) {
  if (isBenignMapResourceError(event.error)) {
    return;
  }

  console.error("Map rendering error:", event.error);
}
