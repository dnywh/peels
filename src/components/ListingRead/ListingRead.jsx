"use client";
import {
  Fragment,
  useState,
  memo,
  useEffect,
  useCallback,
  useRef,
} from "react";

import { useTabBar } from "@/contexts/TabBarContext";

import Link from "next/link";
import { Marker, NavigationControl } from "react-map-gl/maplibre";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
import { Drawer } from "vaul";

import StorageImage from "@/components/StorageImage";
import ChatWindow from "@/components/ChatWindow";
import StyledMap from "@/components/StyledMap";
import MapPin from "@/components/MapPin";
import Button from "@/components/Button";
import { styled } from "@pigment-css/react";
import { useSearchParams, useRouter } from "next/navigation";

import turfDistance from "@turf/distance";
import LoremIpsum from "@/components/LoremIpsum";
import clsx from "clsx";
import ListingCta from "@/components/ListingCta";
import ListingHeader from "@/components/ListingHeader";
import ListingItemList from "@/components/ListingItemList";
import { createClient } from "@/utils/supabase/client";
import { getListingDisplayName } from "@/utils/listing";

const ButtonGroup = styled("div")({
  display: "flex",
  gap: "0.5rem",
});

const sidebarWidth = "clamp(20rem, 30vw, 30rem)";

const StyledDrawerOverlay = styled(Drawer.Overlay)({
  background: "rgba(0, 0, 0, 0.3)",
  position: "fixed",
  inset: "0",
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

// Memoize the Listing component
const ListingRead = memo(function Listing({
  user,
  listing,
  setSelectedListing,
  isDrawer,
  isDesktop,
  isChatDrawerOpen,
  setIsChatDrawerOpen,
}) {
  const { setTabBarProps } = useTabBar();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [existingThread, setExistingThread] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    if (isDrawer) {
      return;
    }

    // Only set the position prop in listings page, not when ListingRead is used in a drawer
    setTabBarProps((prev) => ({
      ...prev,
      position: "floating",
    }));

    return () => {
      setTabBarProps((prev) => ({
        ...prev,
        position: "inherit",
      }));
    };
  }, [setTabBarProps]);

  // Load existing thread if any
  useEffect(() => {
    async function loadExistingThread() {
      // console.log("Loading existing thread for listing:", listing.slug);

      const { data: thread, error } = await supabase
        .from("chat_threads_with_participants")
        .select(
          `
          *,
          chat_messages_with_senders (*)
        `
        )
        .match({
          listing_id: listing.id,
          initiator_id: user.id,
          owner_id: listing.owner_id,
        })
        .maybeSingle();

      if (error) {
        console.error("Error loading thread:", error);
        return;
      }

      setExistingThread(thread);
    }

    if (user && listing) {
      loadExistingThread();
    }
  }, [listing?.id, user?.id]);

  const [mapZoomLevel, setMapZoomLevel] = useState(null);

  const initialZoomLevel = 14;
  useEffect(() => {
    setMapZoomLevel(initialZoomLevel);
  }, []);

  const listingDisplayName = getListingDisplayName(listing, user);

  if (!listing) return null;

  return (
    <Fragment key={listing.id}>
      <ListingHeader listing={listing} listingName={listingDisplayName} />

      <Drawer.NestedRoot
        modal={isDesktop ? false : true}
        direction={isDesktop ? "right" : undefined}
        open={isChatDrawerOpen}
        onOpenChange={(event) => setIsChatDrawerOpen(event)}
      >
        {user ? (
          listing.owner_id === user.id ? (
            <ListingCta type="owner" slug={listing.slug} />
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
          <ListingCta type="guest" slug={listing.slug} />
        )}

        <Drawer.Portal>
          <StyledDrawerOverlay />
          <StyledDrawerContent data-vaul-no-drag={isDesktop ? true : undefined}>
            <ChatWindow
              isDrawer={true}
              setIsChatDrawerOpen={setIsChatDrawerOpen}
              user={user}
              listing={listing}
              listingDisplayName={listingDisplayName}
              existingThread={
                existingThread
                  ? {
                      ...existingThread,
                      chat_messages: existingThread.chat_messages_with_senders,
                    }
                  : null
              }
            />
          </StyledDrawerContent>
        </Drawer.Portal>
      </Drawer.NestedRoot>

      {listing.description && (
        <section>
          <h3>{listing.type === "business" ? "Donation details" : "About"}</h3>
          <p>{listing.description}</p>
        </section>
      )}

      {!isDrawer && (
        <section>
          <h3>Location</h3>
          <StyledMap
            style={{ height: "320px" }}
            interactive={false}
            initialViewState={{
              longitude: listing.longitude,
              latitude: listing.latitude,
              zoom: initialZoomLevel,
            }}
          >
            <Marker
              longitude={listing.longitude}
              latitude={listing.latitude}
              anchor="center"
            >
              <MapPin selected={true} type={listing.type} />
            </Marker>
            <NavigationControl showCompass={false} />
          </StyledMap>

          {listing.type === "residential" && (
            <p>
              {listingDisplayName} is a{" "}
              {listing.area_name
                ? `resident located in ${listing.area_name}`
                : "resident of this area"}
              . Ask them for their exact location when you arrange a food scrap
              drop-off.
            </p>
          )}
          {listing.type === "community" && listing.area_name && (
            <p>
              {listingDisplayName} is a located in {listing.area_name}.
            </p>
          )}
          {listing.type === "business" && listing.area_name && (
            <p>
              {listingDisplayName} is a business located in {listing.area_name}.
            </p>
          )}

          <ButtonGroup>
            <Button
              variant="secondary"
              size="small"
              href={`/map?listing=${listing.slug}`}
            >
              See nearby listings
            </Button>
            {listing.type !== "residential" && (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  href={`https://maps.apple.com/?ll=${listing.latitude},${listing.longitude}&q=${encodeURIComponent(
                    listing.name
                  )}`}
                  target="_blank"
                >
                  Open in Apple Maps
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  href={`https://maps.google.com/?q=${listing.latitude},${listing.longitude}`}
                  target="_blank"
                >
                  Open in Google Maps
                </Button>
              </>
            )}
          </ButtonGroup>
        </section>
      )}

      {listing.accepted_items.length > 0 && (
        <section>
          <h3>Accepted</h3>
          <ListingItemList items={listing.accepted_items} type="accepted" />
        </section>
      )}

      {listing.rejected_items.length > 0 && (
        <section>
          <h3>Not accepted</h3>
          <ListingItemList items={listing.rejected_items} type="rejected" />
        </section>
      )}

      {listing.photos.length > 0 && (
        <section>
          <h3>Photos</h3>
          <ul>
            {listing.photos.map((photo, index) => (
              <li key={index}>
                <StorageImage
                  bucket="listing_photos"
                  filename={photo}
                  alt={`Photo ${index + 1}`}
                  style={{ width: "100px", height: "100px" }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {listing.links.length > 0 && (
        <section>
          <h3>Links</h3>
          <ListingItemList items={listing.links} type="links" />
        </section>
      )}

      {isDrawer && (
        <Button
          variant="secondary"
          size="small"
          width="contained"
          href={`/listings/${listing.slug}`}
        >
          View full listing
        </Button>
      )}
    </Fragment>
  );
});

export default ListingRead;
