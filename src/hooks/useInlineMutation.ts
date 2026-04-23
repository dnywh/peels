"use client";

import { useCallback, useState } from "react";
import type { InlineActionResult } from "@/types/actionResult";

export function getInitialInlineActionResult<T>(): InlineActionResult<T> {
  return {
    success: false,
    error: null,
  };
}

type InlineMutationOptions = {
  fallbackError?: string;
};

export function useInlineMutation<T>() {
  const [result, setResult] = useState<InlineActionResult<T>>(
    getInitialInlineActionResult<T>()
  );
  const [isPending, setIsPending] = useState(false);

  const reset = useCallback(() => {
    setResult(getInitialInlineActionResult<T>());
  }, []);

  const run = useCallback(
    async (
      mutation: () => Promise<InlineActionResult<T>>,
      options: InlineMutationOptions = {}
    ) => {
      if (isPending) {
        return null;
      }

      setIsPending(true);
      setResult(getInitialInlineActionResult<T>());

      try {
        const nextResult = await mutation();
        setResult(nextResult);
        return nextResult;
      } catch (error) {
        const fallbackResult: InlineActionResult<T> = {
          success: false,
          error:
            options.fallbackError ||
            (error instanceof Error ? error.message : "Something went wrong."),
        };

        setResult(fallbackResult);
        return fallbackResult;
      } finally {
        setIsPending(false);
      }
    },
    [isPending]
  );

  return {
    isPending,
    reset,
    result,
    setResult,
    run,
  };
}
