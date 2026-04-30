import { layers, namedFlavor } from "@protomaps/basemaps";

type ProtomapsFlavorName = "light" | "dark";

const PROTOMAPS_LANGUAGE_BY_LOCALE: Record<string, string> = {
  en: "en",
  es: "es",
  de: "de",
  "pt-BR": "pt",
  fr: "fr",
};

export function getProtomapsLanguage(locale: string) {
  return PROTOMAPS_LANGUAGE_BY_LOCALE[locale] ?? "en";
}

export function createProtomapsStyle({
  flavorName,
  locale,
}: {
  flavorName: ProtomapsFlavorName;
  locale: string;
}) {
  return {
    version: 8 as const,
    glyphs:
      "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: `https://protomaps.github.io/basemaps-assets/sprites/v4/${flavorName}`,
    sources: {
      protomaps: {
        type: "vector" as const,
        url: `https://api.protomaps.com/tiles/v4.json?key=${process.env.NEXT_PUBLIC_PROTOMAPS_API_KEY}`,
        attribution: '<a href="https://protomaps.com">Protomaps</a>',
      },
    },
    layers: layers("protomaps", namedFlavor(flavorName), {
      lang: getProtomapsLanguage(locale),
    }),
  };
}
