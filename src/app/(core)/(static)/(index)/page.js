import { Suspense } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import IntroHeader from "@/components/IntroHeader";
import Toast from "@/components/Toast";
import PeelsHowItWorks from "@/components/PeelsHowItWorks";
import HeroButtons from "@/components/HeroButtons";
import PeelsFaq from "@/components/PeelsFaq";
import StaticPageSection from "@/components/StaticPageSection";
import NewsletterIssuesList from "@/components/NewsletterIssuesList";
import HeaderBlock from "@/components/HeaderBlock";
import FooterBlock from "@/components/FooterBlock";
import { styled } from "@pigment-css/react";

export const metadata = {
  title: {
    absolute: `${siteConfig.name}: ${siteConfig.description}`,
  },
};

export default function Index() {
  const t = useTranslations("Index");

  return (
    <StyledMain>
      {/* Search params in Toast component so that this page can remain static. Just requires Suspense here to work */}
      <Suspense>
        <Toast />
      </Suspense>

      <Intro>
        <IntroHeader />
        <h1>{t("title")}</h1>
        <p>{t("subtitle")}</p>

        <HeroButtons />
      </Intro>

      <StaticPageSection padding="lg">
        <HeaderBlock>
          <h2>{t("howItWorks.title")}</h2>
          <p>{t("howItWorks.subtitle")}</p>
        </HeaderBlock>
        <PeelsHowItWorks />
      </StaticPageSection>

      <StaticPageSection padding="lg" id="newsletter-section">
        <HeaderBlock>
          <h2>{t("newsletter.title")}</h2>
          <p>{t("newsletter.subtitle")}</p>
        </HeaderBlock>
        <NewsletterIssuesList />
        <FooterBlock>
          <p>
            {t.rich("newsletter.footer", {
              page: (chunks) => <Link href="/newsletter">{chunks}</Link>,
            })}
          </p>
        </FooterBlock>
      </StaticPageSection>

      <StaticPageSection padding="lg" id="faq-section">
        <HeaderBlock>
          <h2>{t("faq.title")}</h2>
          <p>{t("faq.subtitle")}</p>
        </HeaderBlock>
        <PeelsFaq />
        <FooterBlock>
          <p>
            {t.rich("faq.footer", {
              page: (chunks) => <Link href="/support">{chunks}</Link>,
            })}
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StyledMain>
  );
}

const StyledMain = styled("main")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  paddingTop: "10vh",
  gap: theme.spacing.gap.page.md, // Match section paddingTop
  // marginBottom: theme.spacing.gap.page.md, // Match gap

  "@media (min-width: 768px)": {
    // paddingTop: "24vh",
    gap: theme.spacing.gap.page.lg, // Or ~12rem
    // marginBottom: theme.spacing.gap.page.lg, // Match gap
  },
}));

const Intro = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  gap: "1.5rem",

  "& > h1": {
    maxWidth: "24ch",
    fontSize: "2.75rem",
    letterSpacing: "-0.03em",
    lineHeight: "1.05",
    fontWeight: "775",
    color: theme.colors.text.primary,

    "@media (min-width: 768px)": {
      fontSize: "4.75rem",
    },
  },

  "& > p": {
    maxWidth: "56ch",
    textWrap: "balance",
    fontSize: "1.25rem",
    color: theme.colors.text.ui.quaternary,
    letterSpacing: "-0.028em",

    "@media (min-width: 768px)": {
      fontSize: "1.5rem",
    },
  },
}));
