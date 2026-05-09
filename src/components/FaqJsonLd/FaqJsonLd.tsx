import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import {
  generateFaqJsonLd,
  getFaqEntries,
  getHelpFaqSources,
  getPeelsFaqSources,
} from "@/utils/faqJsonLd";
import type {
  FaqMessageSource,
  FaqNamespace,
  FaqTranslator,
  PeelsFaqVariant,
} from "@/utils/faqJsonLd";

async function getFaqTranslators(sources: FaqMessageSource[]) {
  const namespaces = [...new Set(sources.map((source) => source.namespace))];
  const translatorEntries = await Promise.all(
    namespaces.map(async (namespace) => {
      const t = await getTranslations(namespace);

      return [namespace, t] as const;
    })
  );

  return Object.fromEntries(translatorEntries) as Partial<
    Record<FaqNamespace, FaqTranslator>
  >;
}

export async function PeelsFaqJsonLd({
  variant,
}: {
  variant: PeelsFaqVariant;
}) {
  const sources = getPeelsFaqSources(variant);
  const entries = getFaqEntries(sources, await getFaqTranslators(sources));
  const jsonLd = generateFaqJsonLd(entries);

  return jsonLd ? <JsonLd data={jsonLd} /> : null;
}

export async function HelpFaqJsonLd() {
  const sources = getHelpFaqSources();
  const entries = getFaqEntries(sources, await getFaqTranslators(sources));
  const jsonLd = generateFaqJsonLd(entries);

  return jsonLd ? <JsonLd data={jsonLd} /> : null;
}
