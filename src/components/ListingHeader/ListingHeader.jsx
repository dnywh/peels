import { getListingAvatar } from "@/utils/listing";

import Avatar from "@/components/Avatar";
import Lozenge from "@/components/Lozenge";

import { styled } from "@pigment-css/react";

const StyledListingHeader = styled("header")(({ theme }) => ({
  // width: "100%",

  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "1.625rem", // Account for rotated avatar
  padding: "0 1rem 0 1.75rem", // Match ListingReadSection but also account for rotated avatar
}));

// Match styling in ChatHeader (but keep separate because of complicated alignment logic in ChatHeader)
const TitleBlock = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",

  "& h1": {
    fontSize: "1.25rem",
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
}));

const StyledLozenge = styled(Lozenge)(({ theme }) => ({
  marginLeft: "-0.025rem",
}));

function ListingHeader({ listing, listingName, user }) {
  const avatarProps = getListingAvatar(listing, user);

  return (
    <StyledListingHeader>
      <Avatar
        isDemo={avatarProps?.isDemo}
        src={avatarProps?.isDemo ? avatarProps.path : undefined}
        bucket={!avatarProps?.isDemo ? avatarProps?.bucket : undefined}
        filename={!avatarProps?.isDemo ? avatarProps?.filename : undefined}
        alt={avatarProps?.alt || "The avatar for this listing"}
        size="large"
        listing={listing}
      />

      <TitleBlock>
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
