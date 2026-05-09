type FaqEntry = {
  question: string;
  answer: string;
};

export type PeelsFaqVariant = "summary" | "about" | "community" | "full";

export type FaqMessageSource =
  | {
      namespace: "Support.peelsFaq";
      key:
        | "whatIsPeels"
        | "findDropOff"
        | "noGarden"
        | "businesses"
        | "mapPrivacy"
        | "howDifferent"
        | "fogo"
        | "financialModel"
        | "whosBehind"
        | "getInvolved"
        | "promotion"
        | "government";
    }
  | {
      namespace: "Support.supportFaq";
      key: "manageEmails";
    };

export type FaqNamespace = FaqMessageSource["namespace"];

export type FaqTranslator = {
  raw: (key: string) => unknown;
};

const summaryFaqSources = [
  { namespace: "Support.peelsFaq", key: "whatIsPeels" },
  { namespace: "Support.peelsFaq", key: "findDropOff" },
  { namespace: "Support.peelsFaq", key: "noGarden" },
  { namespace: "Support.peelsFaq", key: "businesses" },
  { namespace: "Support.peelsFaq", key: "mapPrivacy" },
] satisfies FaqMessageSource[];

const aboutFaqSources = [
  { namespace: "Support.peelsFaq", key: "whatIsPeels" },
  { namespace: "Support.peelsFaq", key: "businesses" },
  { namespace: "Support.peelsFaq", key: "howDifferent" },
  { namespace: "Support.peelsFaq", key: "fogo" },
] satisfies FaqMessageSource[];

const communityFaqSources = [
  { namespace: "Support.peelsFaq", key: "financialModel" },
  { namespace: "Support.peelsFaq", key: "whosBehind" },
  { namespace: "Support.peelsFaq", key: "getInvolved" },
  { namespace: "Support.peelsFaq", key: "promotion" },
  { namespace: "Support.peelsFaq", key: "government" },
] satisfies FaqMessageSource[];

const supportFaqSources = [
  { namespace: "Support.peelsFaq", key: "findDropOff" },
  { namespace: "Support.peelsFaq", key: "noGarden" },
  { namespace: "Support.peelsFaq", key: "mapPrivacy" },
  { namespace: "Support.supportFaq", key: "manageEmails" },
] satisfies FaqMessageSource[];

export function getPeelsFaqSources(variant: PeelsFaqVariant) {
  if (variant === "summary") return summaryFaqSources;
  if (variant === "about") return aboutFaqSources;
  if (variant === "community") return communityFaqSources;

  return [...aboutFaqSources, ...communityFaqSources];
}

export function getHelpFaqSources() {
  return [...supportFaqSources, ...aboutFaqSources, ...communityFaqSources];
}

function stringifyMessage(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function stripMessageMarkup(message: string) {
  return message
    .replace(/<\/p>\s*<p>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getFaqEntries(
  sources: FaqMessageSource[],
  translators: Partial<Record<FaqNamespace, FaqTranslator>>
): FaqEntry[] {
  return sources
    .map(({ namespace, key }) => {
      const t = translators[namespace];
      if (!t) return null;

      const question = stripMessageMarkup(
        stringifyMessage(t.raw(`${key}.question`))
      );
      const answer = stripMessageMarkup(
        stringifyMessage(t.raw(`${key}.answer`))
      );

      return question && answer ? { question, answer } : null;
    })
    .filter((entry): entry is FaqEntry => Boolean(entry));
}

export function generateFaqJsonLd(entries: FaqEntry[]) {
  if (entries.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}
