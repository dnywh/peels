"use server";

import { cookies, headers } from "next/headers";
import { defaultLocale, type Locale, locales } from "@/i18n/config";

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
    const headersList = await headers();
    const acceptLanguage = headersList.get("accept-language");
    // console.log("[locale.ts] preferred-locale:", { acceptLanguage });

    // Try to get locale from cookie first
    const cookieLocale = (await cookies()).get(COOKIE_NAME)?.value;
    if (cookieLocale) {
        return cookieLocale;
    }

    // If no cookie, try to use browser preference
    if (acceptLanguage) {
        // Parse value. E.g. from:
        // en-AU,en;q=0.9
        // To:
        // en
        const firstLanguage = acceptLanguage.split(",")[0].split(
            "-",
        )[0] as Locale;
        if (locales.includes(firstLanguage)) {
            return firstLanguage;
        }
    }

    // Always return defaultLocale if no other locale is found
    return defaultLocale;
}

// Used in an explicit component, like a language picker:
// https://next-intl.dev/examples#app-router-without-i18n-routing
export async function setUserLocale(locale: Locale) {
    console.log("Setting locale cookie:", locale);
    (await cookies()).set(COOKIE_NAME, locale);
}
