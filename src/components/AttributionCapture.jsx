// Simple component that captures attribution data on mount
"use client";

import { useEffect } from "react";
import { captureAttributionParams } from "@/utils/attribution";

export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionParams();
  }, []);

  // Render nothing - this is just for side effects
  return null;
}
