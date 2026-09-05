import type { InlineActionResult } from "@/types/actionResult";

export const supportScopes = [
  "account",
  "auth",
  "chat",
  "listing",
  "media",
  "route",
] as const;

export type SupportScope = (typeof supportScopes)[number];

export type SupportSafeContext = {
  operation?: string;
  path?: string;
};

type CreateSupportErrorOptions<T extends object> = {
  context?: SupportSafeContext;
  data?: T;
  error: unknown;
  message: string;
  scope: SupportScope;
};

export function createSupportReference(scope: SupportScope) {
  return `${scope}-${crypto.randomUUID()}`;
}

export function reportSupportError({
  context,
  error,
  scope,
}: {
  context?: SupportSafeContext;
  error: unknown;
  scope: SupportScope;
}) {
  const supportReference = createSupportReference(scope);

  console.error("Unexpected Peels error:", {
    context,
    error,
    scope,
    supportReference,
  });

  return supportReference;
}

export function sanitiseSupportPageUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return value.split(/[?#]/, 1)[0];
  }
}

export function createSupportError<T extends object = Record<string, never>>({
  context,
  data,
  error,
  message,
  scope,
}: CreateSupportErrorOptions<T>): InlineActionResult<
  T & { supportReference: string }
> & {
  data: T & { supportReference: string };
  error: string;
  success: false;
} {
  const supportReference = reportSupportError({
    context,
    error,
    scope,
  });

  return {
    success: false,
    error: message,
    data: {
      ...data,
      supportReference,
    } as T & { supportReference: string },
  };
}
