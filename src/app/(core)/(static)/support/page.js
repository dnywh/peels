import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageSection from "@/components/StaticPageSection";
import EncodedEmailLink from "@/components/EncodedEmailLink";
import SupportFaq from "@/components/SupportFaq";
import PeelsFaq from "@/components/PeelsFaq";
import HeaderBlock from "@/components/HeaderBlock";

export const metadata = {
  title: "Support",
  description: "Answers to common questions about Peels.",
  openGraph: {
    title: `Support · ${siteConfig.name}`,
    description: "Answers to common questions about Peels.",
  },
};

export default function Support() {
  const t = useTranslations("Support");
  return (
    <StaticPageMain>
      <StaticPageHeader
        title={t("title")}
        subtitle={
          <>
            {t.rich("subtitle", {
              email: (chunks) => (
                <EncodedEmailLink
                  as="plain"
                  address={siteConfig.encodedEmail.support}
                >
                  {chunks}
                </EncodedEmailLink>
              ),
            })}
          </>
        }
      />

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
    </StaticPageMain>
  );
}
