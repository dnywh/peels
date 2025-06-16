export type Locale = (typeof locales)[number];

export const locales = ["en", "es"] as const;

// English as the default
export const defaultLocale: Locale = "en";
