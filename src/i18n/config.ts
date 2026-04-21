export type Locale = (typeof locales)[number];

// Any new languages need to have their locale added here
export const locales = ["en", "es", "de", "pt-BR", "fr"] as const;

// English as the default
export const defaultLocale: Locale = "en";

export const localeCookieName = "NEXT_LOCALE";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  de: "Deutsch",
  "pt-BR": "Português (Brasil)",
  fr: "Français",
};

const localeAliasMap: Record<string, Locale> = {
  en: "en",
  "en-au": "en",
  "en-gb": "en",
  "en-us": "en",
  es: "es",
  "es-419": "es",
  "es-ar": "es",
  "es-cl": "es",
  "es-co": "es",
  "es-es": "es",
  "es-mx": "es",
  de: "de",
  "de-at": "de",
  "de-ch": "de",
  "de-de": "de",
  pt: "pt-BR",
  "pt-br": "pt-BR",
  "pt-pt": "pt-BR",
  fr: "fr",
  "fr-be": "fr",
  "fr-ca": "fr",
  "fr-fr": "fr",
};

export function isValidLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function normaliseLocale(
  value: string | null | undefined
): Locale | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  if (isValidLocale(trimmedValue)) {
    return trimmedValue;
  }

  const lowerCaseValue = trimmedValue.toLowerCase();
  const directMatch = localeAliasMap[lowerCaseValue];
  if (directMatch) {
    return directMatch;
  }

  const [baseLanguage] = lowerCaseValue.split("-");
  return localeAliasMap[baseLanguage] ?? null;
}

export function parseAcceptLanguageHeader(
  headerValue: string | null
): Locale[] {
  if (!headerValue) {
    return [];
  }

  return headerValue
    .split(",")
    .map((entry) => {
      const [languageTag, ...params] = entry.trim().split(";");
      const qualityParam = params.find((param) =>
        param.trim().startsWith("q=")
      );
      const parsedQuality = Number.parseFloat(
        qualityParam?.trim().replace("q=", "") ?? "1"
      );
      const quality = Number.isFinite(parsedQuality)
        ? Math.min(Math.max(parsedQuality, 0), 1)
        : 0;

      return {
        quality,
        locale: normaliseLocale(languageTag),
      };
    })
    .filter(
      (entry): entry is { quality: number; locale: Locale } =>
        entry.locale !== null && entry.quality > 0
    )
    .sort((left, right) => right.quality - left.quality)
    .map((entry) => entry.locale);
}
