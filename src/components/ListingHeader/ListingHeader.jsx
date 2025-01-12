import { styled } from "@pigment-css/react";

import Avatar from "@/components/Avatar";
import { getListingAvatar } from "@/utils/listing";

const StyledListingHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "2rem", // Acount for rotated avatar
  paddingLeft: "0.75rem", // Acount for rotated avatar
}));

const StyledText = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",

  "& h2": {
    lineHeight: "1.2",
  },

  "& p": {
    color: theme.colors.text.tertiary,
    textWrap: "balance",
    lineHeight: "1.25",
  },
}));

function ListingHeader({ listing, listingName, user }) {
  const avatarProps = getListingAvatar(listing, user);

  console.log(listing);
  return (
    <StyledListingHeader>
      <Avatar
        bucket={avatarProps.bucket}
        filename={avatarProps.filename}
        alt={avatarProps.alt}
        size={100}
      />

      <StyledText>
        <h2>{listingName}</h2>
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
