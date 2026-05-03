import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageSection from "@/components/StaticPageSection";
import SupportFaq from "@/components/SupportFaq";
import PeelsFaq from "@/components/PeelsFaq";
import HeaderBlock from "@/components/HeaderBlock";
import EmailSelector from "@/components/EmailSelector/EmailSelector";

export async function generateMetadata() {
  const t = await getTranslations("Support");
  const description = t("metaDescription");

  return {
    title: t("title"),
    description,
    openGraph: {
      title: `${t("title")} · ${siteConfig.name}`,
      description,
    },
  };
}

export default function Support() {
  const t = useTranslations("Support");
  return (
    <StaticPageMain>
      <StaticPageHeader title={t("title")} subtitle={t("subtitle")} />

      <StaticPageSection padding={null}>
        <HeaderBlock>
          <h2>{t("supportFaq.title")}</h2>
        </HeaderBlock>
        <SupportFaq />
      </StaticPageSection>

      <StaticPageSection>
        <HeaderBlock>
          <h2>{t("peelsFaq.title")}</h2>
        </HeaderBlock>
        <PeelsFaq />
      </StaticPageSection>

      <StaticPageSection id="contact">
        <HeaderBlock>
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.subtitle")}</p>
        </HeaderBlock>
        <Suspense>
          <EmailSelector />
        </Suspense>
      </StaticPageSection>
    </StaticPageMain>
  );
}
