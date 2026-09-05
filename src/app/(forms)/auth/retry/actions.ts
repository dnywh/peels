"use server";

import { getUserLocale } from "@/i18n/services/locale";
import { normaliseNextPath, resolveAuthLocale } from "@/utils/authRedirects";
import { createClient } from "@/utils/supabase/server";
import { getBaseUrl } from "@/utils/url";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupportError } from "@/lib/supportError";

const getRetryPath = ({
  error,
  locale,
  nextPath,
  success,
  supportReference,
  type,
}: {
  error?: string;
  locale: string;
  nextPath: string;
  success?: string;
  supportReference?: string;
  type: "magiclink" | "signup";
}) => {
  const searchParams = new URLSearchParams({
    locale,
    next: nextPath,
    type,
  });
  if (error) searchParams.set("error", error);
  if (success) searchParams.set("success", success);
  if (supportReference) searchParams.set("support_reference", supportReference);
  return `/auth/retry?${searchParams}`;
};

const getEmailRedirectTo = ({
  locale,
  nextPath,
  origin,
}: {
  locale: string;
  nextPath: string;
  origin: string;
}) => {
  const searchParams = new URLSearchParams({
    locale,
    next: nextPath,
  });
  return `${origin}/auth/complete?${searchParams}`;
};

export async function retryEmailAuthAction(formData: FormData) {
  const t = await getTranslations();
  const email = formData.get("email")?.toString().trim();
  const requestedType = formData.get("type")?.toString();
  const type =
    requestedType === "signup" || requestedType === "magiclink"
      ? requestedType
      : null;
  const nextPath = normaliseNextPath(
    formData.get("next")?.toString(),
    "/profile"
  );
  const locale = resolveAuthLocale(
    formData.get("locale")?.toString() ?? (await getUserLocale())
  );

  if (!type) redirect("/sign-in");

  if (!email) {
    redirect(
      getRetryPath({
        error: t("Errors.emailRequired"),
        locale,
        nextPath,
        type,
      })
    );
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") || getBaseUrl();
  const emailRedirectTo = getEmailRedirectTo({ locale, nextPath, origin });
  const { error } =
    type === "signup"
      ? await supabase.auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo },
        })
      : await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo,
            shouldCreateUser: false,
          },
        });

  if (error) {
    const result = createSupportError({
      context: { operation: `retryEmailAuthAction:${type}` },
      error,
      message: t("Errors.generic"),
      scope: "auth",
    });
    redirect(
      getRetryPath({
        error: result.error ?? t("Errors.generic"),
        locale,
        nextPath,
        supportReference: result.data.supportReference,
        type,
      })
    );
  }

  redirect(
    getRetryPath({
      locale,
      nextPath,
      success: t("Auth.retry.emailSent"),
      type,
    })
  );
}
