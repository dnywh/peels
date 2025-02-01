import {
  getListingAvatar,
  getListingOwnerAvatar,
  getProfileAvatar,
} from "@/utils/listing";

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

  variants: [
    {
      props: { width: "fixed", smallest: "tiny" },
      style: {
        width: "2.5rem",
      },
    },
  ],
});

export default function AvatarPair({
  listing,
  profile,
  user,
  role = "initiator",
  smallest = "small",
  width,
}) {
  // The main avatar could either be the listing's avatar or the message initiator, depending on the context of this component (the role prop)
  const avatarProps =
    role === "owner"
      ? getProfileAvatar(profile?.avatar)
      : getListingAvatar(listing, user);

  return (
    <AvatarContainer width={width} smallest={smallest}>
      <Avatar
        isDemo={avatarProps?.isDemo}
        src={avatarProps?.isDemo ? avatarProps.path : undefined}
        bucket={!avatarProps?.isDemo ? avatarProps?.bucket : undefined}
        filename={!avatarProps?.isDemo ? avatarProps?.filename : undefined}
        alt={avatarProps?.alt || "The avatar for this listing"}
        size={smallest === "small" ? "medium" : "small"}
        listing={listing}
        profile={role === "owner" ? { avatar: profile?.avatar } : undefined}
      />

      {/* Listing owner avatar on top, if needed */}
      {role === "initiator" &&
        listing.type !== "residential" &&
        (() => {
          const ownerAvatarProps = getListingOwnerAvatar(listing);
          return (
            <Avatar
              isDemo={ownerAvatarProps?.isDemo}
              src={ownerAvatarProps?.isDemo ? ownerAvatarProps.path : undefined}
              bucket={
                !ownerAvatarProps?.isDemo ? ownerAvatarProps?.bucket : undefined
              }
              filename={
                !ownerAvatarProps?.isDemo
                  ? ownerAvatarProps?.filename
                  : undefined
              }
              alt={ownerAvatarProps?.alt || "The avatar for this listing"}
              size={smallest === "small" ? "small" : "tiny"}
              rotation="reverse"
              defaultImage="profile.png"
            />
          );
        })()}
    </AvatarContainer>
  );
}
