import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./services/locale";

export default getRequestConfig(async () => {
    // Provide a static locale, fetch a user setting,
    // read from `cookies()`, `headers()`, etc.
    // Handled in locale.ts
    const locale = await getUserLocale();
    // console.log({ locale });

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
