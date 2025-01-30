import { Drawer } from "vaul"; // TODO: Import only used subcomponents?

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/

import { getListingAvatar, getListingOwnerAvatar } from "@/utils/listing";
import Hyperlink from "@/components/Hyperlink";
import Avatar from "@/components/Avatar";
import IconButton from "@/components/IconButton";

import { styled } from "@pigment-css/react";

const StyledChatHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  gap: "1rem",
  borderBottom: `1px solid ${theme.colors.border.base}`,
  backgroundColor: theme.colors.background.top,
  padding: "1rem",
}));

const AvatarContainer = styled("div")({
  flexShrink: 0,

  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",

  "& > *:nth-child(2)": {
    marginLeft: "-0.5rem",
  },
});

const Title = styled("div")(({ theme }) => ({
  fontSize: "1rem",
  fontWeight: "700",
  flex: 1,
}));

function ChatHeader({
  listing,
  user,
  isDrawer,
  recipientName,
  listingIsOwnedByUser,
  isDemo,
}) {
  const avatarProps = getListingAvatar(listing, user);
  const ownerAvatarProps = getListingOwnerAvatar(listing);
  // console.log({ avatarProps });

  return (
    <StyledChatHeader>
      {!isDrawer && !isDemo && (
        <IconButton
          breakpoint="sm"
          action="back"
          onClick={() => router.push("/chats")}
        />
      )}
      {isDrawer && (
        <>
          <VisuallyHidden.Root>
            <Drawer.Title>
              Nested chat drawer title visually hidden TODO
            </Drawer.Title>
            <Drawer.Description>
              Test description for aria visually hidden TODO.
            </Drawer.Description>
          </VisuallyHidden.Root>
        </>
      )}

      {/* Listing avatar (or person's own avatar if residential listing) */}
      <AvatarContainer>
        <Avatar
          isDemo={avatarProps?.isDemo}
          src={avatarProps?.isDemo ? avatarProps.path : undefined}
          bucket={!avatarProps?.isDemo ? avatarProps?.bucket : undefined}
          filename={!avatarProps?.isDemo ? avatarProps?.filename : undefined}
          alt={avatarProps?.alt || "The avatar for this listing"}
          size="large"
        />

        {/* Additional owner_avatar for business or community listing */}
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
            size="small"
          />
        )}
      </AvatarContainer>

      <Title>
        {/* TODO: the below should  be flexible enough to show 'Mary, Ferndale Community Garden' (community or business listing), 'Mary' (residential listing)  */}
        {/* TODO: Extract and have a 'recipientName' const and a more malleable 'recipient and their listing name' as per above */}
        <p>
          {recipientName}
          {!listingIsOwnedByUser && listing?.type !== "residential" && (
            <>, {listing.name}</>
          )}
        </p>
      </Title>

      {!listingIsOwnedByUser && !isDrawer && !isDemo && (
        <>
          {/* <Hyperlink href={`/listings/${listing.slug}`}>View listing</Hyperlink> */}
          <IconButton
            breakpoint="sm"
            action="overflow"
            // onClick={() => router.push("/chats")} TODO: Open overflow menu, which has a 'View listing' option and 'Block user' option
          />
        </>
      )}
      {/* TODO: Overflow menu to block user via Dialog, even if manual for now */}

      {isDrawer && (
        <Drawer.Close asChild>
          <IconButton action="close" />
        </Drawer.Close>
      )}
    </StyledChatHeader>
  );
}

export default ChatHeader;
