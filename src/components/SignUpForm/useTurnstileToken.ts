"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

const BACKGROUND_TOKEN_TIMEOUT = 10000;
const INTERACTIVE_TOKEN_TIMEOUT = 120000;

type UseTurnstileTokenOptions = {
  enabled: boolean;
  failedMessage: (code: string) => string;
  siteKey: string;
  timeoutMessage: string;
  expiredMessage: string;
  unsupportedMessage: string;
};

export function useTurnstileToken({
  enabled,
  failedMessage,
  siteKey,
  timeoutMessage,
  expiredMessage,
  unsupportedMessage,
}: UseTurnstileTokenOptions) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const tokenResolverRef = useRef<((token: string) => void) | null>(null);
  const tokenRejecterRef = useRef<((error: Error) => void) | null>(null);
  const tokenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForToken, setIsWaitingForToken] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  const clearTokenTimeout = useCallback(() => {
    if (tokenTimeoutRef.current) {
      clearTimeout(tokenTimeoutRef.current);
      tokenTimeoutRef.current = null;
    }
  }, []);

  const clearTokenPromise = useCallback(() => {
    tokenResolverRef.current = null;
    tokenRejecterRef.current = null;
    clearTokenTimeout();
  }, [clearTokenTimeout]);

  const rejectTokenPromise = useCallback(
    (errorMessage: string) => {
      tokenRejecterRef.current?.(new Error(errorMessage));
      clearTokenPromise();
    },
    [clearTokenPromise]
  );

  const scheduleTokenTimeout = useCallback(
    (timeout: number, errorMessage = timeoutMessage) => {
      clearTokenTimeout();
      tokenTimeoutRef.current = setTimeout(() => {
        setIsWaitingForToken(false);
        setError(errorMessage);
        rejectTokenPromise(errorMessage);
      }, timeout);
    },
    [clearTokenTimeout, rejectTokenPromise, timeoutMessage]
  );

  const waitForToken = useCallback(
    (timeout = BACKGROUND_TOKEN_TIMEOUT) =>
      new Promise<string>((resolve, reject) => {
        tokenResolverRef.current = resolve;
        tokenRejecterRef.current = reject;
        scheduleTokenTimeout(timeout);
      }),
    [scheduleTokenTimeout]
  );

  const resolveTokenPromise = useCallback(
    (token: string) => {
      tokenResolverRef.current?.(token);
      clearTokenPromise();
    },
    [clearTokenPromise]
  );

  const requestToken = useCallback(async () => {
    if (!enabled) {
      return undefined;
    }

    setError(null);
    setIsWaitingForToken(true);
    turnstileRef.current?.reset();

    try {
      const tokenPromise = waitForToken(BACKGROUND_TOKEN_TIMEOUT);
      turnstileRef.current?.execute();
      return await tokenPromise;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : timeoutMessage;
      setError(errorMessage);
      throw error;
    } finally {
      setIsWaitingForToken(false);
    }
  }, [enabled, timeoutMessage, waitForToken]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => clearTokenPromise, [clearTokenPromise]);

  const turnstileProps = useMemo(
    () => ({
      ref: turnstileRef,
      siteKey,
      onSuccess: (token: string) => {
        setError(null);
        setIsWaitingForToken(false);
        setIsInteractive(false);
        resolveTokenPromise(token);
      },
      onError: (code: string) => {
        const errorMessage = failedMessage(code);
        setIsWaitingForToken(false);
        setIsInteractive(false);
        setError(errorMessage);
        rejectTokenPromise(errorMessage);
      },
      onExpire: () => {
        setIsWaitingForToken(false);
        setIsInteractive(false);
        setError(expiredMessage);
        rejectTokenPromise(expiredMessage);
      },
      onTimeout: () => {
        setIsWaitingForToken(false);
        setIsInteractive(false);
        setError(timeoutMessage);
        rejectTokenPromise(timeoutMessage);
      },
      onUnsupported: () => {
        setIsWaitingForToken(false);
        setIsInteractive(false);
        setError(unsupportedMessage);
        rejectTokenPromise(unsupportedMessage);
      },
      onBeforeInteractive: () => {
        setError(null);
        setIsInteractive(true);
        scheduleTokenTimeout(INTERACTIVE_TOKEN_TIMEOUT);
      },
      onAfterInteractive: () => {
        setIsInteractive(false);
      },
      options: {
        appearance: "interaction-only",
        execution: "execute",
        responseField: false,
      } as const,
    }),
    [
      expiredMessage,
      failedMessage,
      rejectTokenPromise,
      resolveTokenPromise,
      scheduleTokenTimeout,
      siteKey,
      timeoutMessage,
      unsupportedMessage,
    ]
  );

  return {
    error,
    isInteractive,
    isWaitingForToken,
    requestToken,
    resetError,
    turnstileProps,
  };
}
