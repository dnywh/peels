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
  alignItems: "flexStart", // So top-right IconButton components are hugging the top right corner
  gap: "1rem",
  borderBottom: `1px solid ${theme.colors.border.base}`,
  backgroundColor: theme.colors.background.top,
  padding: "1rem",

  // This works! Just moving it directly in the component for clarity. Keeping around for reference
  // [`& ${AvatarContainer}`]: {
  //   display: "none",
  // },

  // "@media (min-width: 768px)": {
  //   [`& ${AvatarContainer}`]: {
  //     display: "flex",
  //   },
  // },
}));

const AvatarContainer = styled("div")({
  margin: "0.25rem 0.625rem 0.25rem 0.25rem", // Account for rotated avatar(s)
  flexShrink: 0,
  "& > *:nth-child(2)": {
    marginLeft: "-1.25rem",
    marginBottom: "-0.25rem",
  },

  display: "none",

  // TODO: Container query, not a media query
  "@media (min-width: 768px)": {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-end",
  },
});

const TitleBlock = styled("div")(({ theme }) => ({
  flex: 1,
  alignSelf: "center",

  fontSize: "1rem",
  fontWeight: "700",

  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  gap: "0.25rem",

  "& h1, & h2 ": {
    // margin: "0",
    textAlign: "center",
    fontSize: "1rem",
    fontWeight: "600",
    lineHeight: "100%",
  },

  "& h1": {
    // fontSize: "1.25rem",
    color: theme.colors.text.ui.primary,
  },

  "& h2": {
    // fontSize: "1rem",
    color: theme.colors.text.ui.quaternary,
  },

  "@media (min-width: 768px)": {
    "& h1, & h2 ": {
      textAlign: "left",
      fontWeight: "700",
    },

    "& h1": {
      fontSize: "1.25rem",
    },

    "& h2": {
      fontSize: "1rem",
    },
  },
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
          icon="back"
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
            rotation="reverse"
          />
        )}
      </AvatarContainer>

      <TitleBlock>
        {/* TODO: the below should  be flexible enough to show 'Mary, Ferndale Community Garden' (community or business listing), 'Mary' (residential listing)  */}
        {/* TODO: Extract and have a 'recipientName' const and a more malleable 'recipient and their listing name' as per above */}
        <h1>
          {isDemo ? "Kerri" : recipientName}
          {!listingIsOwnedByUser && listing?.type !== "residential" && (
            <>, {listing.name}</>
          )}
        </h1>
        {!listingIsOwnedByUser && (
          <h2>
            {listing.type === "residential"
              ? "Residential listing"
              : listing.name}
          </h2>
        )}
      </TitleBlock>

      {!isDrawer && !isDemo && (
        <DropdownMenu.Root>
          {/* <Hyperlink href={`/listings/${listing.slug}`}>View listing</Hyperlink> */}

          <DropdownMenu.Button as={IconButton} icon="overflow" />

          {/* <IconButton
            icon="overflow"
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
          <IconButton icon="close" />
        </Drawer.Close>
      )}
    </StyledChatHeader>
  );
}

export default ChatHeader;
