"use server";

import { cookies, headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { isMissingPreferredLocaleColumn } from "@/utils/postgrest";
import { hasSupabaseAuthCookie } from "@/utils/supabase/authCookies";
import {
  defaultLocale,
  type Locale,
  isValidLocale,
  localeCookieName,
  normaliseLocale,
  parseAcceptLanguageHeader,
} from "@/i18n/config";

export async function getUserLocale() {
  const cookieStore = await cookies();
  const cookieLocale = normaliseLocale(
    cookieStore.get(localeCookieName)?.value ?? null
  );

  const headersList = await headers();
  const acceptedLocales = parseAcceptLanguageHeader(
    headersList.get("accept-language")
  );
  const fallbackLocale = cookieLocale ?? acceptedLocales[0] ?? defaultLocale;

  if (!hasSupabaseAuthCookie(cookieStore.getAll())) {
    return fallbackLocale;
  }

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

  return fallbackLocale;
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
    secure: process.env.NODE_ENV === "production",
  });
}
