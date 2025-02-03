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

const StyledDrawerContent = styled(Drawer.Content)(({ theme }) => ({
  background: theme.colors.background.top,
  borderRadius: `${theme.corners.base} ${theme.corners.base} 0 0`, // Match over drawer content

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
    borderRadius: theme.corners.base, // Match over drawer content
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
}));

const ModalDrawer = ({
  isNested,
  children,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
  isDesktop,
  ...props
}) => {
  const DrawerComponent = isNested ? Drawer.NestedRoot : Drawer.Root;

  return (
    <DrawerComponent
      modal={true}
      direction={isDesktop ? "right" : undefined}
      open={isChatDrawerOpen}
      onOpenChange={setIsChatDrawerOpen}
      {...props}
    >
      {children}
    </DrawerComponent>
  );
};

const NonModalDrawer = ({
  isNested,
  children,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
  isDesktop,
  ...props
}) => {
  const DrawerComponent = isNested ? Drawer.NestedRoot : Drawer.Root;

  return (
    <DrawerComponent
      modal={false}
      direction={isDesktop ? "right" : undefined}
      open={isChatDrawerOpen}
      onOpenChange={setIsChatDrawerOpen}
      {...props}
    >
      {children}
    </DrawerComponent>
  );
};

export default function ListingChatDrawer({
  isNested,
  user,
  listing,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
  existingThread,
  listingDisplayName,
  modalBehavior = "always",
  ...props
}) {
  const { isDesktop, hasTouch } = useDeviceContext();

  const drawerContent = (
    <>
      <ListingCtaContainer>
        {user ? (
          listing.owner_id === user.id ? (
            <ListingCta
              viewer="owner"
              slug={listing.slug}
              visibility={listing.visibility}
              isStub={listing.is_stub}
            />
          ) : listing.is_stub ? (
            <ListingCta
              viewer="guest"
              slug={listing.slug}
              visibility={listing.visibility}
              isStub={true}
            />
          ) : (
            <Drawer.Trigger asChild>
              <Button variant="primary">
                Contact {listing.owner_first_name || "Host"}
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
            user={user}
            listing={listing}
            existingThread={existingThread}
          />
        </StyledDrawerContent>
      </Drawer.Portal>
    </>
  );

  // Use modal drawer for mobile or when modalBehavior is "always"
  if (!isDesktop || modalBehavior === "always") {
    return (
      <ModalDrawer
        isNested={isNested}
        isChatDrawerOpen={isChatDrawerOpen}
        setIsChatDrawerOpen={setIsChatDrawerOpen}
        isDesktop={isDesktop}
        {...props}
      >
        {drawerContent}
      </ModalDrawer>
    );
  }

  // Use non-modal drawer for desktop when modalBehavior is "mobile-only"
  return (
    <NonModalDrawer
      isNested={isNested}
      isChatDrawerOpen={isChatDrawerOpen}
      setIsChatDrawerOpen={setIsChatDrawerOpen}
      isDesktop={isDesktop}
      {...props}
    >
      {drawerContent}
    </NonModalDrawer>
  );
}
