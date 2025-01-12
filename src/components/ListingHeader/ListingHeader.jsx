import { styled } from "@pigment-css/react";

import Avatar from "@/components/Avatar";

const StyledListingHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "2rem", // Acount for rotated avatar
  paddingLeft: "0.75rem", // Acount for rotated avatar

  "& p": {
    color: theme.colors.text.tertiary,
    lineHeight: "1.25",
  },
}));

function ListingHeader({ listing, listingName }) {
  console.log(listing);
  return (
    <StyledListingHeader>
      {listing.type === "residential" ? (
        <Avatar
          bucket="avatars"
          filename={listing.profiles.avatar}
          alt={listing.profiles.first_name}
          size={100}
        />
      ) : (
        <Avatar
          bucket="listing_avatars"
          filename={listing.avatar}
          alt={listing?.name}
          size={100}
        />
      )}

      <div>
        <h2>{listingName}</h2>
        {/* Use getListingDisplayType() here? Or is it too limiting? */}
        {listing.type === "residential" && (
          <p>
            {listing.area_name ? (
              <>
                Resident of <br />
                {listing.area_name}
              </>
            ) : (
              "Local resident"
            )}
          </p>
        )}
        {listing.type === "community" && (
          <p>
            {listing.area_name ? (
              <>
                Community in <br />
                {listing.area_name}
              </>
            ) : (
              "Local community"
            )}
          </p>
        )}
        {listing.type === "business" && (
          <p>
            {listing.area_name ? (
              <>
                Business in <br />
                {listing.area_name}
              </>
            ) : (
              "Local business"
            )}
          </p>
        )}
      </div>
    </StyledListingHeader>
  );
}

export default ListingHeader;
