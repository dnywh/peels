import { getListingAvatar } from "@/utils/listing";

import Avatar from "@/components/Avatar";
import Lozenge from "@/components/Lozenge";

import { styled } from "@pigment-css/react";

const listingHeaderStyles = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "1.625rem", // Account for rotated avatar
  padding: "0 1rem 0 1.75rem", // Match ListingReadSection but also account for rotated avatar
};

const StyledListingHeader = styled("header")(({ theme }) => ({
  ...listingHeaderStyles,

  variants: [
    {
      props: { presentation: "full" },
      style: {
        padding: "0",
        flexDirection: "column",
        alignItems: "center",

        "@media (min-width: 1280px)": {
          // Restore original styles
          ...listingHeaderStyles,
        },
      },
    },
  ],
}));

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
const TitleBlock = styled("div")(({ theme }) => ({
  ...titleBlockStyles,

  "& h1": {
    fontSize: "1.35rem",
    lineHeight: "120%",
    overflowWrap: "break-word",
    hyphens: "manual",
    wordBreak: "break-word", // Above hyphens approach doesn't work, so this is a temporary solution
    color: theme.colors.text.ui.primary,
  },

  "& p": {
    color: theme.colors.text.tertiary,
    textWrap: "balance",
    lineHeight: "125%",
  },

  variants: [
    {
      props: { presentation: "full" },
      style: {
        alignItems: "center",
        gap: "0.5rem",

        "& h1, & p": {
          textAlign: "center",
        },

        "& h1": {
          fontSize: "2rem",
          // color: theme.colors.text.brand.primary,
        },

        "@media (min-width: 1280px)": {
          ...titleBlockStyles,
          // We still want some custom styles for the dedicated listings page (presentation: full)
          "& h1": {
            fontSize: "1.5rem",
            // color: theme.colors.text.ui.primary,
          },
        },
      },
    },
  ],
}));

const StyledLozenge = styled(Lozenge)(({ theme }) => ({
  marginLeft: "-0.025rem",
}));

function ListingHeader({ presentation, listing, listingName, user }) {
  const avatarProps = getListingAvatar(listing, user);

  return (
    <StyledListingHeader presentation={presentation}>
      <Avatar
        isDemo={avatarProps?.isDemo}
        src={avatarProps?.isDemo ? avatarProps.path : undefined}
        bucket={!avatarProps?.isDemo ? avatarProps?.bucket : undefined}
        filename={!avatarProps?.isDemo ? avatarProps?.filename : undefined}
        alt={avatarProps?.alt || "The avatar for this listing"}
        size="large"
        listing={listing}
      />

      <TitleBlock presentation={presentation}>
        <h1>{listingName}</h1>

        {/* Use getListingDisplayType() here? Or is it too limiting? */}
        {listing?.type === "residential" && (
          <p>
            {listing?.area_name ? (
              <>Resident of {listing?.area_name}</>
            ) : (
              "Local resident"
            )}
          </p>
        )}
        {listing?.type === "community" && (
          <p>
            {listing?.area_name ? (
              <>Community in {listing?.area_name}</>
            ) : (
              "Local community"
            )}
          </p>
        )}
        {listing?.type === "business" && (
          <p>
            {listing?.area_name ? (
              <>Business in {listing?.area_name}</>
            ) : (
              "Local business"
            )}
          </p>
        )}
        {listing?.is_stub && <StyledLozenge>Stub</StyledLozenge>}
      </TitleBlock>
    </StyledListingHeader>
  );
}

export default ListingHeader;
