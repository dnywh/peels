import { createClient } from "@/utils/supabase/server";
import {
  appendSuccessParam,
  getLocaleFromSearchParams,
  normaliseNextPath,
} from "@/utils/authRedirects";
import { setUserLocale } from "@/i18n/services/locale";
import { NextResponse } from "next/server";

const isAuthDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";
const INVALID_LINK_MESSAGE =
  "Hmm, that sign-in link is invalid or has expired. Please request a new one.";

const debugAuth = (event: string, data?: Record<string, unknown>) => {
  if (!isAuthDebugEnabled) return;
  console.log("[auth-callback]", event, data ?? {});
};

export async function GET(request: Request) {
  // Legacy/code-based callback route for auth flows that return `?code=...`.
  // Hash-token flows are finalized by AuthHashCompletion + POST /auth/session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const authErrorDescription = requestUrl.searchParams.get("error_description");
  const authType = requestUrl.searchParams.get("type");
  const requestedNextPath =
    requestUrl.searchParams.get("next") ??
    requestUrl.searchParams.get("redirect_to");
  const locale = getLocaleFromSearchParams(requestUrl.searchParams);
  const nextPath = normaliseNextPath(requestedNextPath, "/profile");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      debugAuth("code-exchange-failed", {
        code: error.code ?? null,
        nextPath,
      });
      const signInUrl = new URL("/sign-in", origin);
      signInUrl.searchParams.set("error", INVALID_LINK_MESSAGE);
      signInUrl.searchParams.set("redirect_to", nextPath);
      return NextResponse.redirect(signInUrl);
    }

    const resolvedNextPath =
      authType === "email_change"
        ? appendSuccessParam(nextPath, "email_change")
        : nextPath;

    if (locale) {
      await setUserLocale(locale);
    }

    debugAuth("code-exchange-success", {
      nextPath: resolvedNextPath,
      type: authType ?? null,
    });
    return NextResponse.redirect(new URL(resolvedNextPath, origin));
  }

  if (authErrorDescription) {
    debugAuth("callback-error", {
      nextPath,
      reason: authErrorDescription,
    });
    const signInUrl = new URL("/sign-in", origin);
    signInUrl.searchParams.set("error", INVALID_LINK_MESSAGE);
    signInUrl.searchParams.set("redirect_to", nextPath);
    return NextResponse.redirect(signInUrl);
  }

  debugAuth("missing-code-redirect-complete", { nextPath });
  const completeUrl = new URL("/auth/complete", origin);
  completeUrl.searchParams.set("next", nextPath);
  if (authType) {
    completeUrl.searchParams.set("type", authType);
  }
  if (locale) {
    completeUrl.searchParams.set("locale", locale);
  }
  return NextResponse.redirect(completeUrl);
}
