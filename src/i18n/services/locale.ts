"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  defaultLocale,
  type Locale,
  isValidLocale,
  localeCookieName,
  normaliseLocale,
  parseAcceptLanguageHeader,
} from "@/i18n/config";

function isMissingPreferredLocaleColumn(error: {
  code?: string | null;
  message?: string | null;
}) {
  return (
    error.code === "PGRST204" && /preferred_locale/i.test(error.message ?? "")
  );
}

export async function getUserLocale() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("preferred_locale")
      .eq("id", user.id)
      .single();

    if (profileError && !isMissingPreferredLocaleColumn(profileError)) {
      console.error(
        "Error loading preferred locale from profile:",
        profileError
      );
    }

    const profileLocale = normaliseLocale(profile?.preferred_locale ?? null);
    if (profileLocale) {
      return profileLocale;
    }

    const metadataLocale = normaliseLocale(
      typeof user.user_metadata?.preferred_locale === "string"
        ? user.user_metadata.preferred_locale
        : null
    );
    if (metadataLocale) {
      return metadataLocale;
    }
  }

  const cookieStore = await cookies();
  const cookieLocale = normaliseLocale(
    cookieStore.get(localeCookieName)?.value ?? null
  );
  if (cookieLocale) {
    return cookieLocale;
  }

  const headersList = await headers();
  const acceptedLocales = parseAcceptLanguageHeader(
    headersList.get("accept-language")
  );

  if (acceptedLocales.length > 0) {
    return acceptedLocales[0];
  }

  // Always return defaultLocale if no other locale is found
  return defaultLocale;
}

// Used in an explicit component, like a language picker:
// https://next-intl.dev/examples#app-router-without-i18n-routing
export async function setUserLocale(locale: Locale) {
  if (!isValidLocale(locale)) {
    return;
  }

  (await cookies()).set(localeCookieName, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}
