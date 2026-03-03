"use client";

import { useEffect } from "react";
import {
  getDefaultNextPathByType,
  isSupportedEmailAuthType,
  normalizeNextPath,
} from "@/utils/authRedirects";

const INVALID_LINK_MESSAGE =
  "Hmm, that sign-in link is invalid or has expired. Please request a new one.";

const isAuthDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

const debugAuth = (event: string, data?: Record<string, unknown>) => {
  if (!isAuthDebugEnabled) return;
  console.log("[auth-hash-completion]", event, data ?? {});
};

const redirectToSignIn = (nextPath: string) => {
  const signInUrl = new URL("/sign-in", window.location.origin);
  signInUrl.searchParams.set("error", INVALID_LINK_MESSAGE);
  signInUrl.searchParams.set("redirect_to", nextPath);
  window.location.assign(signInUrl.toString());
};

export default function AuthHashCompletion() {
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const preferredNextPath =
      queryParams.get("next") ?? queryParams.get("redirect_to");
    const requestedType = queryParams.get("type");
    const defaultNextPath = getDefaultNextPathByType(requestedType);
    const nextPath = normalizeNextPath(preferredNextPath, defaultNextPath);

    const authCode = queryParams.get("code");
    if (authCode) {
      debugAuth("detected-pkce-code", {
        nextPath,
        path: window.location.pathname,
      });
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("code", authCode);
      callbackUrl.searchParams.set("next", nextPath);
      window.location.assign(callbackUrl.toString());
      return;
    }

    const hash = window.location.hash;
    if (!hash.startsWith("#")) {
      return;
    }

    const hashParams = new URLSearchParams(hash.slice(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    const type = hashParams.get("type");
    const tokenType = hashParams.get("token_type");
    const hashError = hashParams.get("error");
    const hashErrorDescription = hashParams.get("error_description");

    if (hashError || hashErrorDescription) {
      debugAuth("hash-auth-error", {
        code: hashError ?? null,
        reason: hashErrorDescription ?? null,
        nextPath,
      });
      // Remove auth hash before redirecting away.
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`
      );
      redirectToSignIn(nextPath);
      return;
    }

    if (
      !accessToken ||
      !refreshToken ||
      !type ||
      !tokenType ||
      tokenType.toLowerCase() !== "bearer" ||
      !isSupportedEmailAuthType(type)
    ) {
      return;
    }

    const typedNextPath = normalizeNextPath(
      preferredNextPath,
      getDefaultNextPathByType(type)
    );

    // Remove sensitive hash tokens from the address bar as soon as possible.
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`
    );

    debugAuth("detected-hash-auth", {
      type,
      nextPath: typedNextPath,
      path: window.location.pathname,
    });

    const finalizeSessionFromHash = async () => {
      try {
        const response = await fetch("/auth/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            type,
            next: typedNextPath,
          }),
        });

        const data = (await response.json()) as {
          ok?: boolean;
          next?: string;
          error?: string;
        };

        if (!response.ok || !data.ok) {
          debugAuth("session-finalization-failed", {
            status: response.status,
            reason: data?.error ?? "unknown",
            type,
            nextPath: typedNextPath,
          });
          redirectToSignIn(typedNextPath);
          return;
        }

        const resolvedNextPath = normalizeNextPath(data.next, typedNextPath);
        debugAuth("session-finalized", {
          type,
          nextPath: resolvedNextPath,
        });
        window.location.assign(resolvedNextPath);
      } catch (error) {
        debugAuth("session-finalization-error", {
          type,
          nextPath: typedNextPath,
          reason: error instanceof Error ? error.message : "unknown",
        });
        redirectToSignIn(typedNextPath);
      }
    };

    void finalizeSessionFromHash();
  }, []);

  return null;
}
