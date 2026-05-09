"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const IntroHeaderRotator = dynamic(
  () => import("@/components/IntroHeader/IntroHeaderRotator"),
  { ssr: false }
);

function scheduleIdleTask(callback: () => void) {
  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleCallbackId = idleWindow.requestIdleCallback(callback, {
      timeout: 1_500,
    });

    return () => idleWindow.cancelIdleCallback?.(idleCallbackId);
  }

  const timeoutId = globalThis.setTimeout(callback, 250);
  return () => globalThis.clearTimeout(timeoutId);
}

export default function DeferredIntroHeaderRotator() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => scheduleIdleTask(() => setIsReady(true)), []);

  return isReady ? <IntroHeaderRotator /> : null;
}
