import { styled } from "@pigment-css/react";

import Avatar from "@/components/Avatar";
import { getListingAvatar } from "@/utils/listing";

const StyledListingHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "2rem", // Account for rotated avatar
  padding: "0 1rem 0 1.75rem", // Match ListingReadSection but also account for rotated avatar
}));

const StyledText = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",

  "& h1": {
    fontSize: "1.25rem",
    lineHeight: "1.2",
    overflowWrap: "break-word",
    hyphens: "manual",
    wordBreak: "break-word", // Above hyphens approach doesn't work, so this is a temporary solution
  },

  "& p": {
    color: theme.colors.text.tertiary,
    textWrap: "balance",
    lineHeight: "1.25",
  },
}));

function ListingHeader({ listing, listingName, user }) {
  const avatarProps = getListingAvatar(listing, user);

  return (
    <StyledListingHeader>
      <Avatar
        bucket={avatarProps.bucket}
        filename={avatarProps.filename}
        alt={avatarProps.alt}
        size="large"
      />

      <StyledText>
        <h1>{listingName}</h1>
        {/* Use getListingDisplayType() here? Or is it too limiting? */}
        {listing.type === "residential" && (
          <p>
            {listing.area_name ? (
              <>Resident of {listing.area_name}</>
            ) : (
              "Local resident"
            )}
          </p>
        )}
        {listing.type === "community" && (
          <p>
            {listing.area_name ? (
              <>Community in {listing.area_name}</>
            ) : (
              "Local community"
            )}
          </p>
        )}
        {listing.type === "business" && (
          <p>
            {listing.area_name ? (
              <>Business in {listing.area_name}</>
            ) : (
              "Local business"
            )}
          </p>
        )}
      </StyledText>
    </StyledListingHeader>
  );
}

export default ListingHeader;
