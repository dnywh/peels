"use client";

import { useEffect, useRef, useState } from "react";

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function scheduleIdleTask(callback: () => void) {
  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleCallbackId = idleWindow.requestIdleCallback(callback, {
      timeout: 2_000,
    });

    return () => idleWindow.cancelIdleCallback?.(idleCallbackId);
  }

  const timeoutId = globalThis.setTimeout(callback, 300);
  return () => globalThis.clearTimeout(timeoutId);
}

export function useDeferredHomepageDemo() {
  const [isReady, setIsReady] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isReady) {
      return;
    }

    const markReady = () => setIsReady(true);
    const cancelIdleTask = scheduleIdleTask(markReady);
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                markReady();
              }
            },
            { rootMargin: "600px 0px" }
          )
        : null;

    if (observer && rootRef.current) {
      observer.observe(rootRef.current);
    }

    return () => {
      cancelIdleTask();
      observer?.disconnect();
    };
  }, [isReady]);

  return { isReady, rootRef };
}
