import { getListingAvatar } from "@/utils/listingUtils";

import Avatar from "@/components/Avatar";
import Lozenge from "@/components/Lozenge";

import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const listingHeaderStyles = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "1.625rem", // Account for rotated avatar
  padding: "0 1rem 0 1.75rem", // Match ListingSection but also account for rotated avatar
};

const fullHeaderStyles = css`
  padding: 0;
  flex-direction: column;
  align-items: center;

  @media (min-width: 1280px) {
    display: ${listingHeaderStyles.display};
    flex-direction: ${listingHeaderStyles.flexDirection};
    align-items: ${listingHeaderStyles.alignItems};
    gap: ${listingHeaderStyles.gap};
    padding: ${listingHeaderStyles.padding};
  }
`;

type ListingHeaderPresentation = "full" | "compact" | "demo" | string;

const StyledListingHeader = styled.header<{
  $presentation?: ListingHeaderPresentation;
}>`
  display: ${listingHeaderStyles.display};
  flex-direction: ${listingHeaderStyles.flexDirection};
  align-items: ${listingHeaderStyles.alignItems};
  gap: ${listingHeaderStyles.gap};
  padding: ${listingHeaderStyles.padding};

  ${({ $presentation }) => $presentation === "full" && fullHeaderStyles}
`;

const titleBlockStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  alignItems: "flex-start",
  "& h1, & p": {
    textAlign: "left",
  },
};

// Match styling in ChatHeader (but keep separate because of complicated alignment logic in ChatHeader)
const fullTitleBlockStyles = css`
  align-items: center;
  gap: 0.5rem;

  & h1,
  & p {
    text-align: center;
  }

  & h1 {
    font-size: 2rem;
  }

  @media (min-width: 1280px) {
    display: ${titleBlockStyles.display};
    flex-direction: ${titleBlockStyles.flexDirection};
    gap: ${titleBlockStyles.gap};
    align-items: ${titleBlockStyles.alignItems};

    & h1,
    & p {
      text-align: left;
    }

    & h1 {
      font-size: 1.5rem;
    }
  }
`;

const TitleBlock = styled.div<{ $presentation?: ListingHeaderPresentation }>`
  display: ${titleBlockStyles.display};
  flex-direction: ${titleBlockStyles.flexDirection};
  gap: ${titleBlockStyles.gap};
  align-items: ${titleBlockStyles.alignItems};

  & h1,
  & p {
    text-align: left;
  }

  & h1 {
    font-size: 1.35rem;
    line-height: 120%;
    overflow-wrap: break-word;
    hyphens: manual;
    word-break: break-word;
    color: ${theme.colors.text.ui.primary};
  }

  & p {
    color: ${theme.colors.text.tertiary};
    text-wrap: balance;
    line-height: 125%;
  }

  ${({ $presentation }) => $presentation === "full" && fullTitleBlockStyles}
`;

const StyledLozenge = styled(Lozenge)`
  margin-left: -0.025rem;
`;

function ListingHeader({
  presentation,
  listing,
  listingName,
  user,
}: {
  presentation?: ListingHeaderPresentation;
  listing: any;
  listingName: ReactNode;
  user?: any;
}) {
  const t = useTranslations();
  const avatarProps = getListingAvatar(listing, user);

  return (
    <StyledListingHeader $presentation={presentation}>
      <Avatar
        isDemo={avatarProps?.isDemo}
        src={avatarProps?.isDemo ? avatarProps.path : undefined}
        bucket={!avatarProps?.isDemo ? avatarProps?.bucket : undefined}
        filename={!avatarProps?.isDemo ? avatarProps?.filename : undefined}
        alt={avatarProps?.alt || t("Listings.read.avatarAlt")}
        size="large"
        listing={listing}
      />

      <TitleBlock $presentation={presentation}>
        <h1>{listingName}</h1>

        {/* Use getListingDisplayType() here? Or is it too limiting? */}
        {listing?.type === "residential" && (
          <p>
            {listing?.area_name ? (
              <>{t("Listings.read.residentOf", { area: listing.area_name })}</>
            ) : (
              t("Listings.read.localResident")
            )}
          </p>
        )}
        {listing?.type === "community" && (
          <p>
            {listing?.area_name ? (
              <>{t("Listings.read.communityIn", { area: listing.area_name })}</>
            ) : (
              t("Listings.read.localCommunity")
            )}
          </p>
        )}
        {listing?.type === "business" && (
          <p>
            {listing?.area_name ? (
              <>{t("Listings.read.businessIn", { area: listing.area_name })}</>
            ) : (
              t("Listings.read.localBusiness")
            )}
          </p>
        )}
        {listing?.is_stub && <StyledLozenge>{t("Common.stub")}</StyledLozenge>}
      </TitleBlock>
    </StyledListingHeader>
  );
}

export default ListingHeader;
