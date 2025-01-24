"use client";
import Link from "next/link";
import { styled } from "@pigment-css/react";
import Avatar from "@/components/Avatar";
import StubMarker from "@/components/StubMarker";

const MAX_LISTINGS = 12; // TODO: Store this on Supabase and use in the related RLS policy, so they are always in sync

const ListingsList = styled("ul")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  marginTop: "-0.75rem", // Account for padding below
}));

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
  padding: "0.75rem 1rem", // Visually match parent padding
  display: "flex",
  flexDirection: "row",
  gap: "1.5rem",
  borderRadius: `calc(${theme.corners.base} * 0.625)`,
  borderColor: theme.colors.border.special,
  alignItems: "center",
  // Ensure each item takes up the same height
  minHeight: "4.5rem",

  transition: "background-color 150ms ease-in-out",
  "&:hover": {
    backgroundColor: theme.colors.background.sunk,
  },
});

const AddYourFirstListingLink = styled(Link)(sharedLinkStyles, {
  borderWidth: "1.5px",
  borderStyle: "dashed",
});

const AddAnotherListingLink = styled(Link)(sharedLinkStyles, {
  borderWidth: "1.5px",
  borderStyle: "dashed",
});

const ExistingListingLink = styled(Link)(sharedLinkStyles, {});

const Text = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,

  "& h3": {
    color: theme.colors.text.ui.primary,
    fontSize: "1rem",
  },

  "& p": {
    fontSize: "0.875rem",
    color: theme.colors.text.ui.quaternary,
  },

  variants: [
    {
      props: {
        special: false,
      },
      style: {
        "& p": {
          lineHeight: "100%",
        },
      },
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

export default function ProfileListings({ profile, listings }) {
  if (!listings) return null;

  return (
    <ListingsList>
      {listings.map(({ id, slug, type, name, visibility, is_stub }) => (
        <li key={id}>
          <ExistingListingLink href={`/profile/listings/${slug}`}>
            <Avatar size="small" alt={`Listing photo`} />
            <Text>
              <h3>{type === "residential" ? profile.firstName : name}</h3>
              <p>{type.charAt(0).toUpperCase() + type.slice(1)} listing</p>
              {!visibility && <p>Hidden from map</p>}
            </Text>
            {is_stub && <StubMarker />}
          </ExistingListingLink>
        </li>
      ))}
      {/* Only show the "add a/another listing" link if there are less than the maximum amount of allowed listings OR the user is an admin*/}
      {listings.length < MAX_LISTINGS || profile.is_admin ? (
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
      ) : null}
    </ListingsList>
  );
}
