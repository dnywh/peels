"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import Lozenge from "@/components/Lozenge";
import { styled } from "@pigment-css/react";

const AvatarComponent = Avatar as any;

const MAX_LISTINGS = 12; // TODO: Store this value on Supabase and use in the related RLS policy, so they are always in sync

const ListingsList = styled("ul")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  marginTop: "-0.75rem", // Account for padding below
}));

const LozengeContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  alignItems: "flex-end",

  "@media (min-width: 768px)": {
    flexDirection: "row",
  },
}));

const NewListingAvatar = styled("div")(({ theme }) => ({
  // TODO: Use Avatar component instead of hardcoding the same values here
  width: "40px", // Match the size of the avatar in the Avatar component
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: "2.25rem",

  // Match everything else from Avatar component
  borderRadius: theme.corners.avatar.small,
  flexShrink: 0,
  background: theme.colors.background.pit,
  boxShadow: `0px 0px 0px 2px ${theme.colors.background.top}, 0px 0px 0px 3.5px ${theme.colors.border.base}, 2px 2.5px 0px 2.15px ${theme.colors.border.stark}`,
  transform: `rotate(${theme.rotations.avatar})`,
  color: theme.colors.text.brand.quaternary,
}));

const sharedLinkStyles = ({ theme }: { theme: any }) => ({
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

const textStyles = ({ theme }: { theme: any }) => ({
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
});

const Text = styled("div")(textStyles);

const SpecialText = styled("div")(({ theme }) => ({
  ...textStyles({ theme }),

  "& h3": {
    color: theme.colors.text.brand.primary,
    fontSize: "1.25rem",
  },
}));

type ProfileListingsProps = {
  user: any;
  profile: any;
  listings?: any[] | null;
};

export default function ProfileListings({
  user,
  profile,
  listings,
}: ProfileListingsProps) {
  const t = useTranslations();
  if (!listings) return null;

  return (
    <ListingsList data-testid="profile-listings">
      {listings.map((listing) => {
        return (
          <li key={listing.id}>
            <ExistingListingLink href={`/profile/listings/${listing.slug}`}>
              <AvatarComponent
                size="small"
                profile={listing.type === "residential" ? profile : undefined}
                listing={listing.type !== "residential" ? listing : undefined}
                alt={t("Profile.listingCardAlt", { type: listing.type })}
              />
              <Text>
                <h3>
                  {listing.type === "residential"
                    ? profile.first_name
                    : listing.name}
                </h3>
                <p>{t("Profile.listingCardType", { type: listing.type })}</p>
              </Text>
              {!listing.visibility || listing.is_stub ? (
                <LozengeContainer>
                  {!listing.visibility && (
                    <Lozenge>{t("Common.hidden")}</Lozenge>
                  )}
                  {listing.is_stub && <Lozenge>{t("Common.stub")}</Lozenge>}
                </LozengeContainer>
              ) : null}
            </ExistingListingLink>
          </li>
        );
      })}
      {/* Only show the "add a/another listing" link if there are less than the maximum amount of allowed listings OR the user is an admin*/}
      {listings.length < MAX_LISTINGS || profile.is_admin ? (
        <li>
          {listings.length === 0 ? (
            <AddYourFirstListingLink href="/profile/listings/new">
              <NewListingAvatar aria-hidden="true">+</NewListingAvatar>
              <SpecialText>
                <h3>{t("Profile.addListing")}</h3>
                <p>{t("Profile.listingPrompt")}</p>
              </SpecialText>
            </AddYourFirstListingLink>
          ) : (
            <AddAnotherListingLink href="/profile/listings/new">
              <NewListingAvatar aria-hidden="true">+</NewListingAvatar>
              <Text>
                <h3>{t("Profile.addAnotherListing")}</h3>
              </Text>
            </AddAnotherListingLink>
          )}
        </li>
      ) : null}
    </ListingsList>
  );
}
