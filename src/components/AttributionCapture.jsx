"use client";

import { useEffect } from "react";
import { captureAttributionParams } from "@/utils/attributionUtils";

// Simple component that captures attribution data on mount
// I.e. which site referred the user to Peels
export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionParams();
  }, []);

  // Render nothing, as this is just for side effects
  return null;
}
