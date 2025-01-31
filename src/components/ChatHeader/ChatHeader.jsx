import { useRouter } from "next/navigation";

import { Drawer } from "vaul"; // TODO: Import only used subcomponents?
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/

import { getListingAvatar, getListingOwnerAvatar } from "@/utils/listing";

import Avatar from "@/components/Avatar";
import IconButton from "@/components/IconButton";
import DropdownMenu from "@/components/DropdownMenu";
import Button from "@/components/Button";
import ButtonToDialog from "@/components/ButtonToDialog";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

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
  const router = useRouter();
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
          size="medium"
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

      {!isDrawer && !isDemo && (
        <DropdownMenu.Root>
          {/* <Hyperlink href={`/listings/${listing.slug}`}>View listing</Hyperlink> */}

          <DropdownMenu.Button as={IconButton} action="overflow" />

          {/* <IconButton
            action="overflow"
            // onClick={() => router.push("/chats")} TODO: Open overflow menu, which has a 'View listing' option (if !listingIsOwnedByUser) and 'Block user' option
          /> */}
          <DropdownMenu.Items anchor={{ to: "bottom end", gap: "4px" }}>
            {!listingIsOwnedByUser && (
              <DropdownMenu.Item>
                <Button
                  onClick={() => router.push(`/listings/${listing.slug}`)}
                  variant="secondary"
                  size="small"
                >
                  View listing
                </Button>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item>
              <ButtonToDialog
                variant="danger"
                size="small"
                initialButtonText="Report or block"
                dialogTitle="Let’s get this sorted"
                cancelButtonText="Done"
              >
                Sorry to hear you’re having trouble with {recipientName}. Please{" "}
                <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">
                  contact us
                </EncodedEmailHyperlink>{" "}
                to report the issue or to block them from contacting you any
                more.
              </ButtonToDialog>
            </DropdownMenu.Item>
          </DropdownMenu.Items>
        </DropdownMenu.Root>
      )}

      {isDrawer && (
        <Drawer.Close asChild>
          <IconButton action="close" />
        </Drawer.Close>
      )}
    </StyledChatHeader>
  );
}

export default ChatHeader;
