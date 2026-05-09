"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { scheduleIdleTask } from "@/utils/scheduleIdleTask";

const IntroHeaderRotator = dynamic(
  () => import("@/components/IntroHeader/IntroHeaderRotator"),
  { ssr: false }
);

export default function DeferredIntroHeaderRotator() {
  const [isReady, setIsReady] = useState(false);

  useEffect(
    () =>
      scheduleIdleTask(() => setIsReady(true), {
        timeout: 1_500,
        fallbackDelay: 250,
      }),
    []
  );

  return isReady ? <IntroHeaderRotator /> : null;
}
