"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";

const BACKGROUND_TOKEN_TIMEOUT = 10000;
const INTERACTIVE_TOKEN_TIMEOUT = 120000;

class TokenRequestCancelledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenRequestCancelledError";
  }
}

type UseTurnstileTokenOptions = {
  enabled: boolean;
  failedMessage: (code: string) => string;
  siteKey: string;
  timeoutMessage: string;
  expiredMessage: string;
  notReadyMessage: string;
  unsupportedMessage: string;
};

export function useTurnstileToken({
  enabled,
  failedMessage,
  siteKey,
  timeoutMessage,
  expiredMessage,
  notReadyMessage,
  unsupportedMessage,
}: UseTurnstileTokenOptions) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const isMountedRef = useRef(false);
  const activeRequestIdRef = useRef(0);
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
    (error: Error) => {
      tokenRejecterRef.current?.(error);
      clearTokenPromise();
    },
    [clearTokenPromise]
  );

  const cancelTokenPromise = useCallback(
    (message: string) => {
      rejectTokenPromise(new TokenRequestCancelledError(message));
    },
    [rejectTokenPromise]
  );

  const scheduleTokenTimeout = useCallback(
    (timeout: number, requestId: number, errorMessage = timeoutMessage) => {
      clearTokenTimeout();
      tokenTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && requestId === activeRequestIdRef.current) {
          setIsWaitingForToken(false);
          setError(errorMessage);
        }
        rejectTokenPromise(new Error(errorMessage));
      }, timeout);
    },
    [clearTokenTimeout, rejectTokenPromise, timeoutMessage]
  );

  const waitForToken = useCallback(
    (timeout = BACKGROUND_TOKEN_TIMEOUT) => {
      const requestId = activeRequestIdRef.current + 1;
      activeRequestIdRef.current = requestId;

      const promise = new Promise<string>((resolve, reject) => {
        cancelTokenPromise(
          "Turnstile token request was cancelled because a newer request started."
        );
        tokenResolverRef.current = resolve;
        tokenRejecterRef.current = reject;
        scheduleTokenTimeout(timeout, requestId);
      });

      return { promise, requestId };
    },
    [cancelTokenPromise, scheduleTokenTimeout]
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

    const turnstile = turnstileRef.current;
    if (!turnstile) {
      if (isMountedRef.current) {
        setError(notReadyMessage);
        setIsWaitingForToken(false);
        setIsInteractive(false);
      }
      throw new Error(notReadyMessage);
    }

    setIsWaitingForToken(true);
    turnstile.reset();

    let requestId = activeRequestIdRef.current;

    try {
      const tokenRequest = waitForToken(BACKGROUND_TOKEN_TIMEOUT);
      requestId = tokenRequest.requestId;
      turnstile.execute();
      return await tokenRequest.promise;
    } catch (error) {
      if (error instanceof TokenRequestCancelledError) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : timeoutMessage;
      if (isMountedRef.current && requestId === activeRequestIdRef.current) {
        setError(errorMessage);
      }
      throw error;
    } finally {
      if (isMountedRef.current && requestId === activeRequestIdRef.current) {
        setIsWaitingForToken(false);
      }
    }
  }, [enabled, notReadyMessage, timeoutMessage, waitForToken]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cancelTokenPromise(
        "Turnstile token request was cancelled because the component unmounted."
      );
    };
  }, [cancelTokenPromise]);

  const turnstileProps = useMemo(
    () => ({
      ref: turnstileRef,
      siteKey,
      onSuccess: (token: string) => {
        if (isMountedRef.current) {
          setError(null);
          setIsWaitingForToken(false);
          setIsInteractive(false);
        }
        resolveTokenPromise(token);
      },
      onError: (code: string) => {
        const errorMessage = failedMessage(code);
        if (isMountedRef.current) {
          setIsWaitingForToken(false);
          setIsInteractive(false);
          setError(errorMessage);
        }
        rejectTokenPromise(new Error(errorMessage));
      },
      onExpire: () => {
        if (isMountedRef.current) {
          setIsWaitingForToken(false);
          setIsInteractive(false);
          setError(expiredMessage);
        }
        rejectTokenPromise(new Error(expiredMessage));
      },
      onTimeout: () => {
        if (isMountedRef.current) {
          setIsWaitingForToken(false);
          setIsInteractive(false);
          setError(timeoutMessage);
        }
        rejectTokenPromise(new Error(timeoutMessage));
      },
      onUnsupported: () => {
        if (isMountedRef.current) {
          setIsWaitingForToken(false);
          setIsInteractive(false);
          setError(unsupportedMessage);
        }
        rejectTokenPromise(new Error(unsupportedMessage));
      },
      onBeforeInteractive: () => {
        if (isMountedRef.current) {
          setError(null);
          setIsInteractive(true);
        }
        scheduleTokenTimeout(
          INTERACTIVE_TOKEN_TIMEOUT,
          activeRequestIdRef.current
        );
      },
      onAfterInteractive: () => {
        if (isMountedRef.current) {
          setIsInteractive(false);
        }
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
