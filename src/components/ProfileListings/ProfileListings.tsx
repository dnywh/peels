"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Avatar from "@/components/Avatar";
import Lozenge from "@/components/Lozenge";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

const AvatarComponent = Avatar as any;

const MAX_LISTINGS = 12; // TODO: Store this value on Supabase and use in the related RLS policy, so they are always in sync

const ListingsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: -0.75rem;
`;

const LozengeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const NewListingAvatar = styled.div`
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: ${theme.corners.avatar.small};
  flex-shrink: 0;
  background: ${theme.colors.background.pit};
  box-shadow:
    0px 0px 0px 2px ${theme.colors.background.top},
    0px 0px 0px 3.5px ${theme.colors.border.base},
    2px 2.5px 0px 2.15px ${theme.colors.border.stark};
  transform: rotate(${theme.rotations.avatar});
  color: ${theme.colors.text.brand.quaternary};
`;

const NewListingAvatarGlyph = styled.span`
  display: block;
  font-size: 2.25rem;
  line-height: 1;
  transform: translateY(-0.06em);
`;

const sharedLinkStyles = css`
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  border-radius: calc(${theme.corners.base} * 0.625);
  border-color: ${theme.colors.border.special};
  align-items: center;
  min-height: 4.5rem;
  transition: background-color 150ms ease-in-out;

  &:hover {
    background-color: ${theme.colors.background.sunk};
  }
`;

const dashedLinkStyles = css`
  border-width: 1.5px;
  border-style: dashed;
`;

const textStyles = css`
  display: flex;
  flex-direction: column;
  flex: 1;

  & h3 {
    color: ${theme.colors.text.ui.primary};
    font-size: 1rem;
  }

  & p {
    font-size: 0.875rem;
    color: ${theme.colors.text.ui.quaternary};
  }
`;

const AddYourFirstListingLink = styled(Link)`
  ${sharedLinkStyles}
  ${dashedLinkStyles}
`;

const AddAnotherListingLink = styled(Link)`
  ${sharedLinkStyles}
  ${dashedLinkStyles}
`;

const ExistingListingLink = styled(Link)`
  ${sharedLinkStyles}
`;

const Text = styled.div`
  ${textStyles}
`;

const SpecialText = styled.div`
  ${textStyles}

  & h3 {
    color: ${theme.colors.text.brand.primary};
    font-size: 1.25rem;
  }
`;

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
              <NewListingAvatar aria-hidden="true">
                <NewListingAvatarGlyph>+</NewListingAvatarGlyph>
              </NewListingAvatar>
              <SpecialText>
                <h3>{t("Profile.addListing")}</h3>
                <p>{t("Profile.listingPrompt")}</p>
              </SpecialText>
            </AddYourFirstListingLink>
          ) : (
            <AddAnotherListingLink href="/profile/listings/new">
              <NewListingAvatar aria-hidden="true">
                <NewListingAvatarGlyph>+</NewListingAvatarGlyph>
              </NewListingAvatar>
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
