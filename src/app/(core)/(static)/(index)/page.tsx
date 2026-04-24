import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
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
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { sharedCenteredPageStackStyles } from "@/styles/commonStyles";

export async function generateMetadata() {
  const t = await getTranslations("Index");
  const description = t("metaDescription");
  const keywords = t("metaKeywords")
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    title: {
      absolute: `${siteConfig.name}: ${t("title")}`,
    },
    description,
    keywords,
    openGraph: {
      title: `${siteConfig.name}: ${t("title")}`,
      description,
    },
    twitter: {
      title: `${siteConfig.name}: ${t("title")}`,
      description,
    },
  };
}

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
        <NewsletterIssuesList showPastIssues={false} />
        <FooterBlock>
          <p>
            {t.rich("newsletter.footer", {
              page: (chunks) => (
                <Link href="/newsletter" prefetch={false}>
                  {chunks}
                </Link>
              ),
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
              page: (chunks) => (
                <Link href="/support" prefetch={false}>
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StyledMain>
  );
}

const StyledMain = styled.main`
  ${sharedCenteredPageStackStyles};
  padding-top: 10vh;
  gap: ${theme.spacing.gap.page.md};

  @media (min-width: 768px) {
    gap: ${theme.spacing.gap.page.lg};
  }
`;

const Intro = styled.div`
  ${sharedCenteredPageStackStyles};
  text-align: center;
  gap: 1.5rem;

  & > h1 {
    max-width: 24ch;
    font-size: 2.75rem;
    letter-spacing: -0.03em;
    line-height: 1.05;
    font-weight: 775;
    color: ${theme.colors.text.primary};
    @media (min-width: 768px) {
      font-size: 4.75rem;
    }
  }
  & > p {
    max-width: 56ch;
    text-wrap: balance;
    font-size: 1.25rem;
    color: ${theme.colors.text.ui.quaternary};
    letter-spacing: -0.028em;
    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;
