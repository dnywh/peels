"use client";

import { useEffect } from "react";
import { captureAttributionParams } from "@/utils/attributionUtils";

export default function AttributionCapture(): null {
  useEffect(() => {
    captureAttributionParams();
  }, []);

  return null;
}
