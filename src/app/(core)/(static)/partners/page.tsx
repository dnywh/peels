import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { styled } from "next-yak";

import EncodedEmailLink from "@/components/EncodedEmailLink";
import HeaderBlock from "@/components/HeaderBlock";
import StaticPageHeader from "@/components/StaticPageHeader";
import StaticPageMain from "@/components/StaticPageMain";
import StaticPageSection from "@/components/StaticPageSection";
import StrongLink from "@/components/StrongLink";
import { siteConfig } from "@/config/site";
import { sharedAnchorTagStyles } from "@/styles/commonStyles";
import { theme } from "@/styles/theme.yak";
import { getPromoKitUrl } from "@/utils/storage";

const communityPartners = [
  {
    name: "LOCCAL",
    href: "https://www.loccal.org.au/",
    logoSrc: "/partners/loccal.png",
    logoAltKey: "communityPartners.loccal.logoAlt",
    descriptionKey: "communityPartners.loccal.description",
  },
] as const;

const councilMentions = [
  {
    name: "Waverley Council",
    href: "https://www.waverley.nsw.gov.au/residents/waste_and_recycling/food_waste#:~:text=Otherwise%2C%20you%20can%20use%20the%20Peels%20appThis%20external%20link%20will%20open%20in%20a%20new%20window%20to%20find%20out%20where%20you%20can%20donate%20your%20food%20scraps%20to%20a%20community%20compost.",
  },
  {
    name: "North Sydney Council",
    href: "https://www.northsydney.nsw.gov.au/waste-recycling/avoiding-food-waste#:~:text=Alternatively%2C%20search%20Peels%C2%A0to%20find%20where%20you%20can%20donate%20your%20food%20scraps%20to%20a%20community%20compost.",
  },
  {
    name: "Northern Beaches Council",
    href: "https://www.northernbeaches.nsw.gov.au/services/rubbish-and-recycling/waste-reduction/food-waste#:~:text=Join%C2%A0a%20community%2Drun%20food%20scrap%20recycling%20program%20like%20Peels(Opens%20in%20a%20new%20window)%20to%20connect%20you%20with%20local%20composters%20or%20people%20who%20can%20donate%20food%20scraps%20to%20you.",
  },
  {
    name: "Willoughby City Council",
    href: "https://www.willoughby.nsw.gov.au/Residents/Waste-and-recycling/Sustainable-waste-management/Reducing-food-scraps-at-home#:~:text=If%2520you%2520don%E2%80%99t%2520have%2520space%2520or%2520capacity%2520to%2520compost%2520at%2520home%252C%25C2%25A0Peels%25C2%25A0might%2520be%2520of%2520interest.",
  },
  {
    name: "Hornsby Council",
    href: "https://www.hornsby.nsw.gov.au/property/waste-and-recycling/waste-reduction/organic-waste/Compost-and-Worm-Farming#:~:text=Can%E2%80%99t%2520compost%2520at%2520home?%2520Check%2520out%2520Peels%252C%2520a%2520free%2520platform%2520connecting%2520people%2520with%2520food%2520scraps%2520with%2520people%2520with%2520compost.",
  },
  {
    name: "Darebin City Council",
    href: "https://www.darebin.vic.gov.au/Waste-environment-and-climate/Climate-and-sustainability/Reducing-waste/Avoiding-food-waste#:~:text=Peels%20connects%20folks%20with%20food%20scraps%20to%20those%20who%20compost",
  },
  {
    name: "Merri-bek City Council",
    href: "https://www.merri-bek.vic.gov.au/living-in-merri-bek/waste-and-recycling/bins-and-collection-services/compost-bins-and-worm-farms/#:~:text=If%20you%20cannot%20compost%20at%20home%20you%20could%20consider%20joining%20a%20shared%20composting%20program%20like%20Peels.%20This%20is%20an%20option%20if%20you%20are%20not%20near%20a%20community%20composting%20hub%20or%20your%20local%20community%20composting%20hub%20is%20not%20open%20for%20registrations.",
  },
  {
    name: "Sunshine Coast Council",
    href: "https://www.sunshinecoast.qld.gov.au/living-and-community/waste-and-recycling/recycling-and-waste-education/composting-and-worm-farms#:~:text=use%20Peels%20to%20connect%20with%20someone%20who%20wants%20your%20food%20scraps.",
  },
  {
    name: "Noosa Council",
    href: "https://www.noosa.qld.gov.au/Environment-and-Waste/Waste-and-Recycling/Garden-waste-and-composting#:~:text=Visit%20peels.app%20Connect%20for%20free%20with%20people%20in%20your%20area%20to%20share%20or%20receive%20food%20scraps%20and%20turn%20waste%20into%20compost.",
  },
  {
    name: "City of Moreton Bay",
    href: "https://www.moretonbay.qld.gov.au/Services/Waste-Recycling/Rethink-Waste/Waste-Campaigns/Compost-Week",
  },
  {
    name: "City of Melville",
    href: "https://www.melvillecity.com.au/waste-and-environment/waste-recycling-fogo/waste-items-for-drop-off#:~:text=Sharing%20compost%20%2D%20Peels",
  },
  {
    name: "Camden Council",
    href: "https://www.camden.nsw.gov.au/waste/waste-education#:~:text=Consider%20Peels%2C%20the%20free%20platform%20connecting%20people%C2%A0with%20food%20scraps%20to%20those%20who%20compost.%C2%A0",
  },
  {
    name: "Lockyer Valley Regional Council",
    href: "https://www.lockyervalley.qld.gov.au/our-services/waste-management/reducing-food-waste",
  },
  {
    name: "Hastings District Council",
    href: "https://www.hastingsdc.govt.nz/our-council/news/archive/article/3548/community-composting-solutions",
  },
  {
    name: "Wingecarribee Shire Council",
    href: "https://www.wsc.nsw.gov.au/Environment/Get-Involved/A-Z-Project-Green-School-Resources/Composting-in-the-Community",
  },
  {
    name: "Maroondah City Council",
    href: "https://www.maroondah.vic.gov.au/Residents-property/Waste-recycling/How-to-dispose-of-unwanted-items/A-to-Z-of-waste-disposal-guide/Food-and-food-scraps#:~:text=Ph:%C2%A09870%202602%C2%A0-,Peels%20app,-Find%20a%20neighbour",
  },
  {
    name: "City of Yarra",
    href: "https://www.yarracity.vic.gov.au/climate-and-sustainability/grow-your-own-food/growing-food-home#:~:text=Check%20out%20Peels%20if%20you%20need%20more%20food%20scraps%20or%20you%20don't%20have%20space%20for%20a%20compost%20bin%20or%20worm%20farm%20at%20home",
  },
  {
    name: "Government of Western Australia",
    href: "https://www.wastesorted.wa.gov.au/be-a-great-sort/earth-cycle#:~:text=If%2520you%2520don%E2%80%99t%2520have%2520the%2520time%2520or%2520space%2520to%2520compost%2520at%2520home%252C%2520you%2520can%2520still%2520give%2520your%2520food%2520waste%2520a%2520second%2520chance%2520with%25C2%25A0Peels",
  },
  {
    name: "Town of Cambridge",
    href: "https://www.cambridge.wa.gov.au/Residents/Waste-Recycling/FOGO-Food-Organics-and-Garden-Organics#:~:text=Peels%20is%20an%20Australian%20App%20started%20in%20Brisbane%20for%20Aussies%20to%20share%20their%20waste.",
  },
] as const;

export async function generateMetadata() {
  const t = await getTranslations("Partners");
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

export default async function PartnersPage() {
  const t = await getTranslations("Partners");
  const promoKitUrl = getPromoKitUrl();

  return (
    <StaticPageMain>
      <StaticPageHeader title={t("title")} subtitle={t("subtitle")} />

      <StaticPageSection padding={null}>
        <HeaderBlock>
          <h2>{t("communityPartners.title")}</h2>
          <p>{t("communityPartners.subtitle")}</p>
        </HeaderBlock>
        <PartnerList>
          {communityPartners.map((partner) => (
            <PartnerItem key={partner.name}>
              <PartnerLogoFrame>
                <Image
                  src={partner.logoSrc}
                  alt={t(partner.logoAltKey)}
                  width={240}
                  height={180}
                  priority
                />
              </PartnerLogoFrame>
              <PartnerCopy>
                <h3>{partner.name}</h3>
                <p>{t(partner.descriptionKey)}</p>
                <StrongLink href={partner.href} target="_blank">
                  {t("communityPartners.visitPartner", { name: partner.name })}
                </StrongLink>
              </PartnerCopy>
            </PartnerItem>
          ))}
        </PartnerList>
      </StaticPageSection>

      <StaticPageSection>
        <HeaderBlock>
          <h2>{t("councilMentions.title")}</h2>
          <p>{t("councilMentions.subtitle")}</p>
        </HeaderBlock>
        <MentionCard>
          <MentionGrid aria-label={t("councilMentions.listLabel")}>
            {councilMentions.map((mention) => (
              <li key={mention.name}>
                <StrongLink href={mention.href} target="_blank">
                  {mention.name}
                </StrongLink>
              </li>
            ))}
          </MentionGrid>
        </MentionCard>
      </StaticPageSection>

      <StaticPageSection>
        <Callout>
          <h2>{t("cta.title")}</h2>
          <p>
            {t.rich("cta.body", {
              promoKit: (chunks) => (
                <StrongLink href={promoKitUrl}>{chunks}</StrongLink>
              ),
              email: (chunks) => (
                <EncodedEmailLink address={siteConfig.encodedEmail.general}>
                  {chunks}
                </EncodedEmailLink>
              ),
            })}
          </p>
        </Callout>
      </StaticPageSection>
    </StaticPageMain>
  );
}

const PartnerList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};
  list-style: none;
`;

const PartnerItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: calc(${theme.spacing.unit} * 3);
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};
  text-align: center;

  & h3 {
    margin-bottom: 0.375rem;
    font-size: 1.45rem;
    line-height: ${theme.typography.lineHeight.h};
    color: ${theme.colors.text.primary};
  }

  & p {
    color: ${theme.colors.text.ui.quaternary};
    font-size: ${theme.typography.size.p.md};
    line-height: ${theme.typography.lineHeight.p.md};
  }

  @media (min-width: 640px) {
    flex-direction: row;
    align-items: center;
    text-align: left;
    padding: calc(${theme.spacing.unit} * 4);
  }
`;

const PartnerLogoFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: min(100%, 14rem);
  padding: 2rem;
  border-radius: calc(${theme.corners.base} * 0.75);
  background: ${theme.colors.background.slight};
  border: 1px solid ${theme.colors.border.light};

  & img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const PartnerCopy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  @media (min-width: 640px) {
    align-items: flex-start;
  }
`;

const MentionCard = styled.div`
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};
  padding: calc(${theme.spacing.unit} * 1.5);
  background: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};
`;

const MentionGrid = styled.ul`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.25rem;
  width: 100%;
  list-style: none;

  & li {
    min-width: 0;
    padding: 0.875rem 1rem;
    text-align: center;
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.size.p.md};
    line-height: ${theme.typography.lineHeight.p.md};

    &:not(:first-child) {
      border-top: 1px solid ${theme.colors.border.light};
    }
  }

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    & li:nth-child(2) {
      border-top: none;
    }
  }
`;

const Callout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.gap.sectionInner};
  width: 100%;
  max-width: ${theme.spacing.container.maxWidth.media};
  text-align: center;

  & h2 {
    font-size: 1.75rem;
    line-height: ${theme.typography.lineHeight.h};
    color: ${theme.colors.text.primary};
  }

  & p {
    max-width: 48ch;
    color: ${theme.colors.text.ui.quaternary};
    font-size: ${theme.typography.size.p.lg};
    line-height: ${theme.typography.lineHeight.p.lg};
    text-wrap: balance;
  }

  & a {
    ${sharedAnchorTagStyles}
    color: ${theme.colors.text.brand.primary};
  }
`;
