"use server";

import { setUserLocale } from "@/i18n/services/locale";
import {
  appendSuccessParam,
  getDefaultNextPathByType,
  getLocaleFromSearchParams,
  isSupportedEmailAuthType,
  normaliseNextPath,
} from "@/utils/authRedirects";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

const INVALID_LINK_MESSAGE =
  "Hmm, that sign-in link is invalid or has expired. Please request a new one.";

const isAuthDebugEnabled = process.env.NEXT_PUBLIC_AUTH_DEBUG === "true";

const debugAuth = (event: string, data?: Record<string, unknown>) => {
  if (!isAuthDebugEnabled) return;
  console.log("[auth-confirm]", event, data ?? {});
};

const redirectToSignIn = (nextPath: string): never => {
  const searchParams = new URLSearchParams({
    error: INVALID_LINK_MESSAGE,
    redirect_to: nextPath,
  });
  redirect(`/sign-in?${searchParams}`);
};

export async function confirmEmailAuthAction(formData: FormData) {
  const authType = formData.get("type")?.toString() ?? null;
  const tokenHash = formData.get("token_hash")?.toString();
  const requestedNextPath = formData.get("next")?.toString();
  const localeSearchParams = new URLSearchParams();
  const localeValue = formData.get("locale")?.toString();
  if (localeValue) localeSearchParams.set("locale", localeValue);

  const locale = getLocaleFromSearchParams(localeSearchParams);
  const defaultNextPath = getDefaultNextPathByType(authType);
  const nextPath = normaliseNextPath(requestedNextPath, defaultNextPath);

  if (!tokenHash || !isSupportedEmailAuthType(authType)) {
    debugAuth("invalid-confirm-submission", {
      hasTokenHash: Boolean(tokenHash),
      authType,
      nextPath,
    });
    return redirectToSignIn(nextPath);
  }

  const verifiedAuthType = authType;
  const verifiedTokenHash = tokenHash;
  const supabase = await createClient();
  const email = formData.get("email")?.toString();
  const verificationPayload =
    verifiedAuthType === "email" && email
      ? { token_hash: verifiedTokenHash, type: verifiedAuthType, email }
      : { token_hash: verifiedTokenHash, type: verifiedAuthType };

  const { error } = await supabase.auth.verifyOtp(verificationPayload);

  if (error) {
    debugAuth("verify-otp-failed", {
      code: error.code ?? null,
      authType,
      nextPath,
    });
    return redirectToSignIn(nextPath);
  }

  const resolvedNextPath =
    authType === "email_change"
      ? appendSuccessParam(nextPath, "email_change")
      : nextPath;

  if (locale) {
    await setUserLocale(locale);
  }

  debugAuth("verify-otp-success", {
    authType,
    nextPath: resolvedNextPath,
  });
  redirect(resolvedNextPath);
}
