"use client";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useDeviceContext } from "@/hooks/useDeviceContext";
import { Drawer } from "vaul";
import Button from "@/components/Button";
import ChatWindow from "@/components/ChatWindow";
import ListingCta from "@/components/ListingCta";
import { styled } from "@pigment-css/react";

import type { Listing } from "@/types/listing";

const sidebarWidth = "clamp(20rem, 30vw, 30rem)";

const StyledDrawerOverlay = styled(Drawer.Overlay)({
  background: "rgba(0, 0, 0, 0.3)",
  position: "fixed",
  inset: "0",
});

const ListingCtaContainer = styled("div")({
  padding: "0 1rem",

  "& > *": {
    width: "100%",
  },
});

const StyledDrawerContent = styled(Drawer.Content)(({ theme }) => ({
  background: theme.colors.background.top,
  borderRadius: `${theme.corners.base} ${theme.corners.base} 0 0`,

  overflowX: "hidden",

  "&::after": {
    display: "none",
  },

  marginTop: "24px",
  height: "95%",
  position: "fixed",
  bottom: "0",
  left: "0",
  right: "0",
  display: "flex",
  flexDirection: "column",

  "@media (min-width: 768px)": {
    borderRadius: theme.corners.base,
    height: "unset",
    marginTop: "unset",
    top: "24px",
    right: "24px",
    bottom: "24px",
    left: "unset",
    outline: "none",
    width: sidebarWidth,
  },
}));

type ListingChatDrawerProps = {
  isNested?: boolean;
  user: User | null;
  listing: Listing;
  isChatDrawerOpen: boolean;
  setIsChatDrawerOpen: (open: boolean) => void;
  existingThread: unknown;
};

type SharedDrawerProps = {
  isNested?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  direction?: "right";
  children?: ReactNode;
};

// We need two drawer variants because `modal` changes which hooks vaul renders.
function ModalDrawer({ isNested, ...rest }: SharedDrawerProps) {
  const DrawerComponent = isNested ? Drawer.NestedRoot : Drawer.Root;
  return <DrawerComponent modal={true} {...rest} />;
}

function NonModalDrawer({ isNested, ...rest }: SharedDrawerProps) {
  const DrawerComponent = isNested ? Drawer.NestedRoot : Drawer.Root;
  return <DrawerComponent modal={false} {...rest} />;
}

export default function ListingChatDrawer({
  isNested,
  user,
  listing,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
  existingThread,
}: ListingChatDrawerProps) {
  const { isDesktop, hasTouch } = useDeviceContext();

  // Mobile: always modal. Desktop: modal only if NOT a nested drawer.
  // (`!isNested` treats an omitted prop the same as `false`.)
  const shouldUseModal = !isDesktop || !isNested;

  const visibility = listing.visibility ?? undefined;
  const isStub = listing.is_stub ?? undefined;

  const drawerContent = (
    <>
      <ListingCtaContainer>
        {user ? (
          listing.owner_id === user.id ? (
            <ListingCta
              viewer="owner"
              slug={listing.slug}
              visibility={visibility}
              isStub={isStub}
            />
          ) : listing.is_stub ? (
            <ListingCta
              viewer="guest"
              slug={listing.slug}
              visibility={visibility}
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
            visibility={visibility}
            isStub={isStub}
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

  const DrawerComponent = shouldUseModal ? ModalDrawer : NonModalDrawer;

  return (
    <DrawerComponent
      isNested={isNested}
      open={isChatDrawerOpen}
      onOpenChange={setIsChatDrawerOpen}
      direction={isDesktop ? "right" : undefined}
    >
      {drawerContent}
    </DrawerComponent>
  );
}
