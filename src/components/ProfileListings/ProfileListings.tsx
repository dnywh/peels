import Link from "next/link";
import Avatar from "@/components/Avatar";
import Lozenge from "@/components/Lozenge";
import { MAX_LISTINGS_PER_USER } from "@/config/listingLimits";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { Listing, ListingType } from "@/types/listing";

type ProfileListingProfile = {
  first_name?: string | null;
  is_admin?: boolean | null;
  avatar?: string | null;
};

type ProfileListingsCopy = {
  listingCardAlt: Record<ListingType, string>;
  listingCardType: Record<ListingType, string>;
  hidden: string;
  stub: string;
  addListing: string;
  listingPrompt: string;
  addAnotherListing: string;
};

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
  width: 100%;
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
  profile: ProfileListingProfile | null;
  listings?: Listing[] | null;
  copy: ProfileListingsCopy;
};

export default function ProfileListings({
  profile,
  listings,
  copy,
}: ProfileListingsProps) {
  if (!listings) return null;

  return (
    <ListingsList data-testid="profile-listings">
      {listings.map((listing) => {
        const listingType = listing.type ?? "residential";
        const isResidential = listingType === "residential";

        return (
          <li key={listing.id}>
            <ExistingListingLink href={`/profile/listings/${listing.slug}`}>
              <Avatar
                size="small"
                profile={isResidential ? (profile ?? undefined) : undefined}
                listing={
                  !isResidential
                    ? {
                        type: listingType,
                        avatar: listing.avatar,
                        owner_avatar: listing.owner_avatar,
                      }
                    : undefined
                }
                alt={copy.listingCardAlt[listingType]}
              />
              <Text>
                <h3>{isResidential ? profile?.first_name : listing.name}</h3>
                <p>{copy.listingCardType[listingType]}</p>
              </Text>
              {!listing.visibility || listing.is_stub ? (
                <LozengeContainer>
                  {!listing.visibility && <Lozenge>{copy.hidden}</Lozenge>}
                  {listing.is_stub && <Lozenge>{copy.stub}</Lozenge>}
                </LozengeContainer>
              ) : null}
            </ExistingListingLink>
          </li>
        );
      })}
      {/* Only show the "add a/another listing" link if there are less than the maximum amount of allowed listings OR the user is an admin*/}
      {listings.length < MAX_LISTINGS_PER_USER || profile?.is_admin ? (
        <li>
          {listings.length === 0 ? (
            <AddYourFirstListingLink href="/profile/listings/new">
              <NewListingAvatar aria-hidden="true">
                <NewListingAvatarGlyph>+</NewListingAvatarGlyph>
              </NewListingAvatar>
              <SpecialText>
                <h3>{copy.addListing}</h3>
                <p>{copy.listingPrompt}</p>
              </SpecialText>
            </AddYourFirstListingLink>
          ) : (
            <AddAnotherListingLink href="/profile/listings/new">
              <NewListingAvatar aria-hidden="true">
                <NewListingAvatarGlyph>+</NewListingAvatarGlyph>
              </NewListingAvatar>
              <Text>
                <h3>{copy.addAnotherListing}</h3>
              </Text>
            </AddAnotherListingLink>
          )}
        </li>
      ) : null}
    </ListingsList>
  );
}
