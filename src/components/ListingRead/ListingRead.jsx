"use client";
import {
  Fragment,
  useState,
  memo,
  useEffect,
  useCallback,
  useRef,
} from "react";

import Link from "next/link";
import { Marker, NavigationControl } from "react-map-gl/maplibre";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
import { Drawer } from "vaul";

import StorageImage from "@/components/StorageImage";
import ChatWindow from "@/components/ChatWindow";
import StyledMap from "@/components/StyledMap";
import MapPin from "@/components/MapPin";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import LinkButton from "@/components/LinkButton";
import { styled } from "@pigment-css/react";

import turfDistance from "@turf/distance";
import LoremIpsum from "@/components/LoremIpsum";
import clsx from "clsx";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const sidebarWidth = "clamp(20rem, 30vw, 30rem)";
// const pagePadding = "24px";

const StyledDrawerOverlay = styled(Drawer.Overlay)({
  // className="fixed inset-0 bg-black/30"
  background: "rgba(0, 0, 0, 0.3)",
  position: "fixed",
  inset: "0",
});

const StyledDrawerContent = styled(Drawer.Content)({
  background: "rgb(243, 243, 243)",
  borderRadius: "10px 10px 0 0", // rounded-t-[10px]
  // border: "1px solid #E5E7EB", // border-gray-200

  overflowX: "hidden",

  // Different from parent
  // overflowBehavior: "auto",
  // overflowY: "auto",

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
    // const desktopDrawerClassNames = `shadow-lg right-[24px] top-[24px] bottom-[24px] fixed outline-none flex flex-col`;
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

const StyledDrawerHeader = styled("header")({
  background: "rgb(243, 243, 243)",
  borderBottom: "1px solid #e0e0e0",
  // position: "sticky",
  // top: "0",
  padding: "1rem",
});

const StyledDrawerInner = styled("div")({
  // className={`flex flex-col w-full ${isDesktop ? "rounded-b-lg h-full" : undefined} px-4 bg-gray-50 overflow-y-auto`}
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: "1rem",

  // overscrollBehavior: "auto",
  overflowY: "auto",

  flex: 1,

  "@media (min-width: 768px)": {
    borderBottomRadius: "10px",
    // height: "100%",
    // padding: "16px",
  },
});

const StyledCallout = styled("aside")({
  border: "1px solid grey",
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [existingThread, setExistingThread] = useState(null);
  const supabase = createClient();
  // Load existing thread if any
  useEffect(() => {
    async function loadExistingThread() {
      console.log("Loading existing thread for listing:", listing.slug);

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

      // console.log("Found existing thread:", thread);
      setExistingThread(thread);
    }

    if (user && listing) {
      loadExistingThread();
    }
  }, [listing?.id, user?.id]);

  // const mapRef = useRef(null);
  // const [distanceAcrossMapWidth, setDistanceAcrossMapWidth] = useState(0);
  // const [mapWidth, setMapWidth] = useState(0);
  // const [isChatOpen, setIsChatOpen] = useState(false);
  const [mapZoomLevel, setMapZoomLevel] = useState(null);

  const initialZoomLevel = 14;
  useEffect(() => {
    setMapZoomLevel(initialZoomLevel);
  }, []);
  // TODO: is this secure? Should this be done on the server or database?
  let listingName =
    listing?.type === "residential"
      ? listing?.profiles?.first_name
      : listing?.name;
  if (!user && listing?.type === "residential") {
    listingName = "Private Host";
  }

  // function getDistance() {
  //   console.log("Map loaded or moved, getting distance across map width");

  //   if (!mapRef.current) return;
  //   //   "Project latlng to pixel xy",
  //   //   mapRef.current.getMap().project({ lng: 0, lat: 0 })
  //   // );

  //   const topLeftCorner = mapRef.current.getMap().unproject([0, 0]);
  //   const topRightCorner = mapRef.current.getMap().unproject([mapWidth, 0]);

  //   console.log(
  //     // "First two points",
  //     // mapRef.current.getMap().project({ lng: 0, lat: 0 }),
  //     // mapRef.current.getMap().project({ lng: 1, lat: 0 }),
  //     // "Last two points",
  //     // mapRef.current.getMap().project({ lng: 153, lat: -33 }),
  //     // mapRef.current.getMap().project({ lng: 154, lat: -33 }),
  //     "Difference in X values",
  //     mapRef.current.getMap().project({ lng: 154, lat: -33 }).x -
  //       mapRef.current.getMap().project({ lng: 153, lat: -33 }).x
  //     // "Difference in Y values",
  //     // mapRef.current.getMap().project({ lng: 154, lat: -33 }).y -
  //     //   mapRef.current.getMap().project({ lng: 153, lat: -33 }).y
  //   );
  //   const bounds = mapRef.current.getMap().getBounds();

  //   const northWestCorner = {
  //     lng: bounds._sw.lng,
  //     lat: bounds._ne.lat,
  //   };

  //   const nextDistance = turfDistance(
  //     [northWestCorner.lat, northWestCorner.lng],
  //     [bounds._ne.lat, bounds._ne.lng]
  //   );
  //   setDistanceAcrossMapWidth(nextDistance);
  // }

  // Fetch on map move
  // const handleMapMove = useCallback(() => {
  //   getDistance();
  // }, []);

  // const handleMapResize = useCallback(() => {
  //   setMapWidth(mapRef.current.getMap().getContainer().clientWidth);
  //   getDistance();
  // }, []);

  if (!listing) return null;
  {
    /* {setSelectedListing && <IconButton onClick={setSelectedListing} />} */
  }
  return (
    <Fragment key={listing.id}>
      <div className="flex flex-row gap-3">
        {listing.type === "residential" ? (
          <StorageImage
            bucket="avatars"
            filename={listing.profiles.avatar}
            alt={listing.profiles.first_name}
            style={{ width: "100px", height: "100px" }}
          />
        ) : (
          <StorageImage
            bucket="listing_avatars"
            filename={listing.avatar}
            alt={listing.name}
            style={{ width: "100px", height: "100px" }}
          />
        )}

        <div className="flex flex-col">
          <h2 className="text-2xl mt-2 font-medium text-gray-900">
            {listingName}
          </h2>
          <p className="text-lg text-gray-600">{listing.type}</p>
          {/* <p>Last active: TODO</p> */}
        </div>
      </div>

      <StyledCallout>
        <p>
          {user && listing.owner_id === user.id
            ? "This is your own listing, show button to edit instead of chat"
            : "Not your listing, show button to chat"}
        </p>

        <Drawer.NestedRoot
          modal={isDesktop ? false : true}
          direction={isDesktop ? "right" : undefined}
          open={isChatDrawerOpen}
          onOpenChange={(event) => setIsChatDrawerOpen(event)}
        >
          {user ? (
            listing.owner_id === user.id ? (
              <LinkButton href={`/profile/listings/${listing.slug}`}>
                Edit listing
              </LinkButton>
            ) : (
              <Drawer.Trigger
                asChild
                // onClick={handleChatOpen}
              >
                <Button>
                  Contact{" "}
                  {listing.type === "residential"
                    ? listing.profiles.first_name
                    : listing.name}
                </Button>
              </Drawer.Trigger>
            )
          ) : (
            <LinkButton href={`/sign-in?from=listing&slug=${listing.slug}`}>
              Contact host
            </LinkButton>
          )}

          <Drawer.Portal>
            <StyledDrawerOverlay />
            <StyledDrawerContent
              data-vaul-no-drag={isDesktop ? true : undefined} // Or detect via touch input vs no touch input instead?
              // Desktop drawer offset
              // Overridden in globals.css
              // style={{ "--initial-transform": "calc(100% - 420px)" }}
            >
              {/* "p-4 bg-white rounded-t-[10px] flex-1 */}

              <ChatWindow
                // ref={drawerContentRef}
                // data-vaul-no-drag
                isDrawer={true}
                setIsChatDrawerOpen={setIsChatDrawerOpen}
                user={user}
                listing={listing}
                listingName={listingName}
                existingThread={
                  existingThread
                    ? {
                        ...existingThread,
                        chat_messages:
                          existingThread.chat_messages_with_senders,
                      }
                    : null
                }
                // setIsChatOpen={setIsChatOpen}
              />
            </StyledDrawerContent>
          </Drawer.Portal>
        </Drawer.NestedRoot>
      </StyledCallout>

      {listing.description && (
        <>
          <h3>{listing.type === "business" ? "Donation details" : "About"}</h3>
          <p>{listing.description}</p>
        </>
      )}

      {!isDrawer && (
        <>
          <h3>Location</h3>
          <StyledMap
            // ref={mapRef}
            style={{ height: "320px" }}
            interactive={false}
            initialViewState={{
              longitude: listing.longitude,
              latitude: listing.latitude,
              zoom: initialZoomLevel,
            }}
            // onZoom={(event) => {
            //   // console.log("box zoom end", event);
            //   setMapZoomLevel(event.viewState.zoom);
            // }}
            // onLoad={handleMapResize}
            // onMove={handleMapMove}
            // onResize={handleMapResize}
          >
            <Marker
              longitude={listing.longitude}
              latitude={listing.latitude}
              anchor="center"
            >
              <MapPin selected={true} />
            </Marker>
            <NavigationControl showCompass={false} />
          </StyledMap>
          {listing.type === "residential" && (
            <p>Contact host for their exact location.</p>
          )}
          <Link href={`/map?listing=${listing.slug}`}>See nearby listings</Link>
        </>
      )}
      {listing.type === "residential" ? (
        <p>Contact host for their exact location.</p>
      ) : (
        <>
          <a
            href={`https://maps.apple.com/?ll=${listing.latitude},${listing.longitude}&q=${encodeURIComponent(
              listing.name
            )}`}
            target="_blank"
          >
            Apple Maps
          </a>
          <a
            href={`https://maps.google.com/?q=${listing.latitude},${listing.longitude}`}
            target="_blank"
          >
            Google Maps
          </a>
        </>
      )}

      {listing.accepted_items.length > 0 && (
        <>
          <h3>Accepted</h3>
          <ul className="list-disc divide-y divide-dashed">
            {listing.accepted_items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {listing.rejected_items.length > 0 && (
        <>
          <h3>Not accepted</h3>
          <ul className="list-disc divide-y divide-dashed">
            {listing.rejected_items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}

      {listing.photos.length > 0 && (
        <>
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
        </>
      )}

      {listing.links.length > 0 && (
        <>
          <h3>Links</h3>
          <ul>
            {listing.links.map((link, index) => (
              <li key={index}>
                <Link href={link} target="_blank">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link href={`/listings/${listing.slug}`}>Permalink</Link>
      {/* <h3>Raw data</h3>
        <pre>{JSON.stringify(listing, null, 2)}</pre> */}
    </Fragment>
  );
});

export default ListingRead;
