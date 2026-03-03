import { createClient } from "@/utils/supabase/server";
import {
  appendSuccessParam,
  getDefaultNextPathByType,
  isSupportedEmailAuthType,
  normalizeNextPath,
} from "@/utils/authRedirects";
import { NextResponse } from "next/server";

const INVALID_LINK_MESSAGE =
  "Hmm, that sign-in link is invalid or has expired. Please request a new one.";

const isAuthDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

const debugAuth = (event: string, data?: Record<string, unknown>) => {
  if (!isAuthDebugEnabled) return;
  console.log("[auth-confirm]", event, data ?? {});
};

const toSignInRedirect = (origin: string, nextPath: string) => {
  const signInUrl = new URL("/sign-in", origin);
  signInUrl.searchParams.set("error", INVALID_LINK_MESSAGE);
  signInUrl.searchParams.set("redirect_to", nextPath);
  return NextResponse.redirect(signInUrl);
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const authType = requestUrl.searchParams.get("type");
  const tokenHash =
    requestUrl.searchParams.get("token_hash") ??
    requestUrl.searchParams.get("token");
  const requestedNextPath =
    requestUrl.searchParams.get("next") ??
    requestUrl.searchParams.get("redirect_to");
  const defaultNextPath = getDefaultNextPathByType(authType);
  const nextPath = normalizeNextPath(requestedNextPath, defaultNextPath);

  if (!tokenHash || !isSupportedEmailAuthType(authType)) {
    debugAuth("invalid-confirm-query", {
      hasTokenHash: Boolean(tokenHash),
      authType: authType ?? null,
      nextPath,
    });
    return toSignInRedirect(origin, nextPath);
  }

  const supabase = await createClient();
  const email = requestUrl.searchParams.get("email");
  const verificationPayload =
    authType === "email" && email
      ? { token_hash: tokenHash, type: authType, email }
      : { token_hash: tokenHash, type: authType };

  const { error } = await supabase.auth.verifyOtp(verificationPayload);

  if (error) {
    debugAuth("verify-otp-failed", {
      code: error.code ?? null,
      authType,
      nextPath,
    });
    return toSignInRedirect(origin, nextPath);
  }

  const resolvedNextPath =
    authType === "email_change"
      ? appendSuccessParam(nextPath, "email_change")
      : nextPath;

  debugAuth("verify-otp-success", {
    authType,
    nextPath: resolvedNextPath,
  });
  return NextResponse.redirect(new URL(resolvedNextPath, origin));
}
