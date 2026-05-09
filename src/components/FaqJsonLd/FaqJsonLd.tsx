import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import {
  generateFaqJsonLd,
  getFaqEntries,
  getHelpFaqSources,
  getPeelsFaqSources,
} from "@/utils/faqJsonLd";
import type { PeelsFaqVariant } from "@/utils/faqJsonLd";

async function getFaqTranslators() {
  const [peelsT, supportT] = await Promise.all([
    getTranslations("Support.peelsFaq"),
    getTranslations("Support.supportFaq"),
  ]);

  return {
    "Support.peelsFaq": peelsT,
    "Support.supportFaq": supportT,
  };
}

export async function PeelsFaqJsonLd({
  variant,
}: {
  variant: PeelsFaqVariant;
}) {
  const entries = getFaqEntries(
    getPeelsFaqSources(variant),
    await getFaqTranslators()
  );
  const jsonLd = generateFaqJsonLd(entries);

  return jsonLd ? <JsonLd data={jsonLd} /> : null;
}

export async function HelpFaqJsonLd() {
  const entries = getFaqEntries(getHelpFaqSources(), await getFaqTranslators());
  const jsonLd = generateFaqJsonLd(entries);

  return jsonLd ? <JsonLd data={jsonLd} /> : null;
}
