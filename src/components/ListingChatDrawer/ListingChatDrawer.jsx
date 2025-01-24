"use client";
import { useDeviceContext } from "@/hooks/useDeviceContext";
import { Drawer } from "vaul";
import Button from "@/components/Button";
import ChatWindow from "@/components/ChatWindow";
import ListingCta from "@/components/ListingCta";
import { styled } from "@pigment-css/react";

const sidebarWidth = "clamp(20rem, 30vw, 30rem)";

const StyledDrawerOverlay = styled(Drawer.Overlay)({
  background: "rgba(0, 0, 0, 0.3)",
  position: "fixed",
  inset: "0",
});

const ListingCtaContainer = styled("div")({
  padding: "0 1rem", // Match padding from other parts of ListingRead

  "& > *": {
    width: "100%",
  },
});

const StyledDrawerContent = styled(Drawer.Content)({
  background: "rgb(243, 243, 243)",
  borderRadius: "10px 10px 0 0",

  overflowX: "hidden",

  "&::after": {
    display: "none", // Otherwise seems to include side scroll, even when overflowX hidden
  },

  marginTop: "24px",
  // maxHeight: "95%",
  height: "95%", // Take up full height even if the message contents aren't overflowing yet
  position: "fixed",
  bottom: "0",
  left: "0",
  right: "0",
  display: "flex",
  flexDirection: "column",

  "@media (min-width: 768px)": {
    borderRadius: "10px",
    height: "unset",
    marginTop: "unset",
    top: "24px",
    right: "24px",
    bottom: "24px",
    left: "unset",
    outline: "none",
    width: sidebarWidth,
    // height: "100%",
  },
});

export default function ListingChatDrawer({
  isNested, // true for map, false for listing page
  user,
  listing,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
  existingThread,
  listingDisplayName,
  ...props
}) {
  const { isDesktop, hasTouch } = useDeviceContext();
  const DrawerComponent = isNested ? Drawer.NestedRoot : Drawer.Root;

  const modality = isNested ? (isDesktop ? false : true) : true;

  return (
    <DrawerComponent
      modal={modality}
      direction={isDesktop ? "right" : undefined}
      open={isChatDrawerOpen}
      onOpenChange={setIsChatDrawerOpen}
      {...props}
    >
      <ListingCtaContainer>
        {user ? (
          listing.owner_id === user.id ? (
            <ListingCta
              viewer="owner"
              slug={listing.slug}
              visibility={listing.visibility}
              isStub={listing.is_stub}
            />
          ) : (
            <Drawer.Trigger asChild>
              <Button>
                Contact{" "}
                {listing.type === "residential"
                  ? listing.profiles.first_name
                  : listing.name}
              </Button>
            </Drawer.Trigger>
          )
        ) : (
          <ListingCta
            viewer="guest"
            slug={listing.slug}
            visibility={listing.visibility}
            isStub={listing.is_stub}
          />
        )}
      </ListingCtaContainer>

      <Drawer.Portal>
        <StyledDrawerOverlay />
        <StyledDrawerContent data-vaul-no-drag={!hasTouch ? true : undefined}>
          <ChatWindow
            isDrawer={true}
            setIsChatDrawerOpen={setIsChatDrawerOpen}
            user={user}
            listing={listing}
            listingDisplayName={listingDisplayName}
            existingThread={existingThread}
          />
        </StyledDrawerContent>
      </Drawer.Portal>
    </DrawerComponent>
  );
}
