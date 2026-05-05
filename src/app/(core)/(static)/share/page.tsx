import { ArrowDownToLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { styled } from "next-yak";

import FooterBlock from "@/components/FooterBlock";
import HeaderBlock from "@/components/HeaderBlock";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageSection from "@/components/StaticPageSection";
import { siteConfig } from "@/config/site";
import { theme } from "@/styles/theme.yak";
import { getShareResourcesUrl } from "@/utils/storage";

const resourceKeys = ["digital", "print", "workshop"] as const;
const copyExampleKeys = ["shortest", "medium", "long"] as const;

export async function generateMetadata() {
  const t = await getTranslations("Share");
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

export default async function SharePage() {
  const t = await getTranslations("Share");

  return (
    <StaticPageMain>
      <StaticPageHeader title={t("heading")} subtitle={t("subtitle")} />

      <StaticPageSection padding={null}>
        <IntroPanel>
          <DownloadButton
            href={getShareResourcesUrl()}
            target="_blank"
            rel="noopener"
          >
            <ArrowDownToLine size={20} aria-hidden="true" />
            {t("downloadAll")}
          </DownloadButton>
          <p>{t("downloadHint")}</p>
        </IntroPanel>
      </StaticPageSection>

      <StaticPageSection>
        <HeaderBlock>
          <h2>{t("resources.title")}</h2>
          <p>{t("resources.subtitle")}</p>
        </HeaderBlock>

        <ResourceGrid>
          {resourceKeys.map((resourceKey) => (
            <ResourceCard key={resourceKey}>
              <h3>{t(`resources.items.${resourceKey}.title`)}</h3>
              <p>{t(`resources.items.${resourceKey}.body`)}</p>
            </ResourceCard>
          ))}
        </ResourceGrid>
      </StaticPageSection>

      <StaticPageSection>
        <HeaderBlock>
          <h2>{t("copyExamples.title")}</h2>
          <p>{t("copyExamples.subtitle")}</p>
        </HeaderBlock>

        <CopyExampleList aria-label={t("copyExamples.listLabel")}>
          {copyExampleKeys.map((exampleKey, index) => (
            <CopyExampleDetails key={exampleKey} open={index === 0}>
              <summary>{t(`copyExamples.items.${exampleKey}.title`)}</summary>
              <p>{t(`copyExamples.items.${exampleKey}.body`)}</p>
            </CopyExampleDetails>
          ))}
        </CopyExampleList>

        <FooterBlock>
          <p>
            {t.rich("copyExamples.partnersNote", {
              partners: (chunks) => (
                <Link href={siteConfig.links.partners}>{chunks}</Link>
              ),
            })}
          </p>
        </FooterBlock>
      </StaticPageSection>
    </StaticPageMain>
  );
}

const IntroPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.text};
  text-align: center;

  & p {
    color: ${theme.colors.text.ui.quaternary};
    font-size: ${theme.typography.size.p.md};
    line-height: ${theme.typography.lineHeight.p.md};
  }
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 3.5rem;
  padding: 0 calc(${theme.spacing.unit} * 2);
  border-radius: ${theme.corners.base};
  background: ${theme.colors.button.primary.background};
  color: ${theme.colors.button.primary.text};
  font-size: 1.125rem;
  font-weight: 500;
  text-decoration: none;
  box-shadow: 0px 0px 0px 2px ${theme.colors.button.primary.background};
  transition:
    background 100ms ease-in-out,
    box-shadow 100ms ease-in-out,
    transform 50ms ease-out;

  &:visited {
    color: ${theme.colors.button.primary.text};
  }

  &:hover {
    background: color-mix(
      in srgb,
      ${theme.colors.button.primary.background},
      ${theme.colors.button.primary.hover.tint}
        ${theme.colors.button.primary.hover.mix}
    );
    box-shadow: 0px 0px 0px 2px
      color-mix(
        in srgb,
        ${theme.colors.button.primary.background},
        ${theme.colors.button.primary.hover.tint}
          ${theme.colors.button.primary.hover.mix}
      );
  }

  &:focus-visible {
    outline: 3px solid ${theme.colors.focus.outline};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};

  @media (min-width: 700px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const ResourceCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: calc(${theme.spacing.unit} * 3);
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};

  & h3 {
    color: ${theme.colors.text.primary};
    font-size: 1.25rem;
    line-height: ${theme.typography.lineHeight.h};
  }

  & p {
    color: ${theme.colors.text.ui.quaternary};
    font-size: ${theme.typography.size.p.md};
    line-height: ${theme.typography.lineHeight.p.md};
  }
`;

const CopyExampleList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};
`;

const CopyExampleDetails = styled.details`
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};
  overflow: hidden;

  & summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: calc(${theme.spacing.unit} * 2.5) calc(${theme.spacing.unit} * 3);
    cursor: pointer;
    color: ${theme.colors.text.primary};
    font-size: 1.125rem;
    font-weight: 600;
    line-height: ${theme.typography.lineHeight.h};
    list-style: none;

    &::marker,
    &::-webkit-details-marker {
      display: none;
      content: none;
    }

    &::after {
      content: "+";
      color: ${theme.colors.background.counter};
      font-size: 1.75rem;
      font-weight: 200;
      line-height: 0.8;
    }
  }

  &[open] summary::after {
    content: "-";
  }

  & p {
    padding: 0 calc(${theme.spacing.unit} * 3) calc(${theme.spacing.unit} * 3);
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.size.p.lg};
    line-height: ${theme.typography.lineHeight.p.lg};
  }
`;
