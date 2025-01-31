import { getListingAvatar, getListingOwnerAvatar } from "@/utils/listing";

import Avatar from "@/components/Avatar";

import { styled } from "@pigment-css/react";

const AvatarContainer = styled("div")({
  margin: "0.25rem 0.625rem 0.25rem 0.25rem", // Account for rotated avatar(s)
  flexShrink: 0,
  alignSelf: "center",

  "& > *:nth-child(2)": {
    marginLeft: "-1.25rem",
    marginBottom: "-0.25rem",
  },

  // display: "none",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",

  // TODO: Container query, not a media query
  "@media (min-width: 768px)": {},
});

export default function AvatarPair({ listing, user, smallest = "small" }) {
  console.log({ listing });
  const avatarProps = getListingAvatar(listing, user);
  const ownerAvatarProps = getListingOwnerAvatar(listing);

  return (
    <AvatarContainer>
      <Avatar
        isDemo={avatarProps?.isDemo}
        src={avatarProps?.isDemo ? avatarProps.path : undefined}
        bucket={!avatarProps?.isDemo ? avatarProps?.bucket : undefined}
        filename={!avatarProps?.isDemo ? avatarProps?.filename : undefined}
        alt={avatarProps?.alt || "The avatar for this listing"}
        size={smallest === "small" ? "medium" : "small"}
        listing={listing}
      />

      {listing.type !== "residential" && (
        <Avatar
          isDemo={ownerAvatarProps?.isDemo}
          src={ownerAvatarProps?.isDemo ? ownerAvatarProps.path : undefined}
          bucket={
            !ownerAvatarProps?.isDemo ? ownerAvatarProps?.bucket : undefined
          }
          filename={
            !ownerAvatarProps?.isDemo ? ownerAvatarProps?.filename : undefined
          }
          alt={ownerAvatarProps?.alt || "The avatar for this listing"}
          size={smallest === "small" ? "small" : "tiny"}
          rotation="reverse"
          defaultImage="profile.png"
        />
      )}
    </AvatarContainer>
  );
}
