import { getRequestConfig } from "next-intl/server";
import { getUserLocale } from "./services/locale";
import deepmerge from "deepmerge";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  // Handled in locale.ts
  const locale = await getUserLocale();
  // console.log({ locale });

  // Fallback to English if another language is missing translations
  const userMessages = (await import(`../../messages/${locale}.json`)).default;
  const defaultMessages = (await import(`../../messages/en.json`)).default;
  const messages = deepmerge(defaultMessages, userMessages);

  return {
    locale,
    messages,
  };
});
