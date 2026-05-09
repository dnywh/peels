type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

type ScheduleIdleTaskOptions = {
  timeout?: number;
  fallbackDelay?: number;
};

export function scheduleIdleTask(
  callback: () => void,
  { timeout = 2_000, fallbackDelay = 250 }: ScheduleIdleTaskOptions = {}
) {
  const idleWindow = window as IdleWindow;

  if (typeof idleWindow.requestIdleCallback === "function") {
    const idleCallbackId = idleWindow.requestIdleCallback(callback, {
      timeout,
    });

    return () => idleWindow.cancelIdleCallback?.(idleCallbackId);
  }

  const timeoutId = globalThis.setTimeout(callback, fallbackDelay);
  return () => globalThis.clearTimeout(timeoutId);
}
