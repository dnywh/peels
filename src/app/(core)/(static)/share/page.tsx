import { ArrowDownToLine } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { styled } from "next-yak";

import HeaderBlock from "@/components/HeaderBlock";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageSection from "@/components/StaticPageSection";
import { siteConfig } from "@/config/site";
import { theme } from "@/styles/theme.yak";
import { getPromoKitUrl } from "@/utils/storage";

const resourceKeys = ["digital", "print", "copy", "workshop"] as const;
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
            href={getPromoKitUrl()}
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

        <CopyExampleList>
          {copyExampleKeys.map((exampleKey) => (
            <CopyExampleCard key={exampleKey}>
              <h3>{t(`copyExamples.items.${exampleKey}.title`)}</h3>
              <p>{t(`copyExamples.items.${exampleKey}.body`)}</p>
            </CopyExampleCard>
          ))}
        </CopyExampleList>

        <ExampleNote>
          {t.rich("copyExamples.partnersNote", {
            partners: (chunks) => (
              <Link href={siteConfig.links.partners}>{chunks}</Link>
            ),
          })}
        </ExampleNote>
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

const CopyExampleCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: calc(${theme.spacing.unit} * 3);
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};

  & h3 {
    color: ${theme.colors.text.primary};
    font-size: 1.125rem;
    line-height: ${theme.typography.lineHeight.h};
  }

  & p {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.size.p.lg};
    line-height: ${theme.typography.lineHeight.p.lg};
  }
`;

const ExampleNote = styled.p`
  max-width: ${theme.spacing.container.maxWidth.text};
  color: ${theme.colors.text.ui.quaternary};
  font-size: ${theme.typography.size.p.md};
  line-height: ${theme.typography.lineHeight.p.md};
  text-align: center;

  & a {
    color: ${theme.colors.text.brand.primary};
    font-weight: 500;
  }

  & a:visited {
    color: ${theme.colors.text.brand.primary};
  }
`;
