export type Locale = (typeof locales)[number];

// Any new languages need to have their locale added here
export const locales = ["en", "es", "de"] as const;

// English as the default
export const defaultLocale: Locale = "en";
