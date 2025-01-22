"use client";
import Link from "next/link";
import { styled } from "@pigment-css/react";
import Avatar from "@/components/Avatar";

const NewListingAvatar = styled("div")(({ theme }) => ({
  width: "32px", // Match the size of the avatar in the Avatar component
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: "2.25rem",

  // Match everything else from Avatar component
  borderRadius: theme.corners.avatar.small,
  flexShrink: 0,
  background: theme.colors.background.pit,
  boxShadow: `0px 0px 0px 3px ${theme.colors.background.top}, 0px 0px 0px 4px ${theme.colors.border.base}, 2.5px 3px 0px 3px ${theme.colors.border.stark}`,
  transform: `rotate(${theme.rotations.avatar})`,
  color: theme.colors.text.brand.quaternary,
}));

const sharedLinkStyles = ({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  gap: "1.5rem",
  borderRadius: theme.corners.base,
  padding: "1rem",
  borderColor: theme.colors.border.special,
  alignItems: "center",

  transition: "background-color 150ms ease-in-out",
  "&:hover": {
    backgroundColor: theme.colors.background.sunk,
  },
});

const AddYourFirstListingLink = styled(Link)(sharedLinkStyles, {
  borderWidth: "2px",
  borderStyle: "dashed",
});

const AddAnotherListingLink = styled(Link)(sharedLinkStyles, {
  border: "1px solid blue",
});

const ExistingListingLink = styled(Link)(sharedLinkStyles, {
  border: "1px solid green",
});

const Text = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",

  "& h3": {
    color: theme.colors.text.ui.primary,
    fontSize: "1rem",
  },

  "& p": {
    color: theme.colors.text.ui.quaternary,
  },

  variants: [
    {
      props: {
        special: true,
      },
      style: {
        "& h3": {
          color: theme.colors.text.brand.primary,
          fontSize: "1.25rem",
        },
      },
    },
  ],
}));

export default function ProfileListings({ firstName, listings }) {
  if (!listings) return null;

  return (
    <ul>
      {listings.map(({ id, slug, type, name, visibility }) => (
        <li key={id}>
          <ExistingListingLink href={`/profile/listings/${slug}`}>
            <Avatar size="small" alt={`Listing photo`} />
            <Text>
              <h3>{type === "residential" ? firstName : name}</h3>
              <p>{type.charAt(0).toUpperCase() + type.slice(1)} listing</p>
              {!visibility && <p>Hidden from map</p>}
            </Text>
          </ExistingListingLink>
        </li>
      ))}
      {/* Only show the "add a/another listing" link if there are less than 3 listings */}
      {listings.length < 3 && (
        <li>
          {listings.length === 0 ? (
            <AddYourFirstListingLink href="/profile/listings/new">
              <NewListingAvatar aria-hidden="true">+</NewListingAvatar>
              <Text special={true}>
                <h3>Add a listing</h3>
                <p>
                  Put yourself, your community spot, or your business on the map
                </p>
              </Text>
            </AddYourFirstListingLink>
          ) : (
            <AddAnotherListingLink href="/profile/listings/new">
              <NewListingAvatar aria-hidden="true">+</NewListingAvatar>
              <Text>
                <h3>Add another listing</h3>
              </Text>
            </AddAnotherListingLink>
          )}
        </li>
      )}
    </ul>
  );
}
