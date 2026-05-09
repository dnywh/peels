"use client";

import { useEffect, useRef, useState } from "react";
import { scheduleIdleTask } from "@/utils/scheduleIdleTask";

export function useDeferredHomepageDemo() {
  const [isReady, setIsReady] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isReady) {
      return;
    }

    const markReady = () => setIsReady(true);
    const cancelIdleTask = scheduleIdleTask(markReady, {
      timeout: 2_000,
      fallbackDelay: 300,
    });
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
