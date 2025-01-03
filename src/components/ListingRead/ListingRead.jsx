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

import { Drawer } from "vaul";

import StorageImage from "@/components/StorageImage";
import ChatWindow from "@/components/ChatWindow";
import StyledMap from "@/components/StyledMap";
import MapPin from "@/components/MapPin";
import Button from "@/components/Button";
import CloseButton from "@/components/CloseButton";
import LinkButton from "@/components/LinkButton";
import { styled } from "@pigment-css/react";

import turfDistance from "@turf/distance";
import LoremIpsum from "@/components/LoremIpsum";
import clsx from "clsx";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const StyledCallout = styled("aside")({
  border: "1px solid grey",
});

// Memoize the Listing component
const ListingRead = memo(function Listing({
  user,
  listing,
  setSelectedListing,
  modal,
  isDesktop,
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

      console.log("Found existing thread:", thread);
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
    /* {setSelectedListing && <CloseButton onClick={setSelectedListing} />} */
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
        >
          {user ? (
            listing.owner_id === user.id ? (
              <LinkButton href={`/profile/listings/${listing.slug}`}>
                Edit listing
              </LinkButton>
            ) : (
              <Drawer.Trigger
                className="rounded-md mt-4 w-full bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                // onClick={handleChatOpen}
              >
                Contact{" "}
                {listing.type === "residential"
                  ? listing.profiles.first_name
                  : listing.name}
              </Drawer.Trigger>
            )
          ) : (
            <LinkButton href={`/sign-up?from=listing&slug=${listing.slug}`}>
              Contact host
            </LinkButton>
          )}

          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/30" />
            <Drawer.Content className="bg-white flex flex-col rounded-t-[10px] lg:h-[327px] h-full mt-24 max-h-[95%] fixed bottom-0 left-0 right-0">
              {/* "p-4 bg-white rounded-t-[10px] flex-1 */}
              <header className="py-2  px-4 ">
                <Drawer.Description className="sr-only">
                  Test description for aria.
                </Drawer.Description>
                {/* Handle */}
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mb-8" />
                {/* Button */}
                <Drawer.Close>Close this drawer</Drawer.Close>
                {/* <CloseButton onClick={handleChatClose}>Close</CloseButton> */}

                <Drawer.Title className="font-medium mb-4 text-gray-900">
                  Nested chat drawer
                </Drawer.Title>
              </header>

              <div
                // ref={drawerContentRef}
                // data-vaul-no-drag
                className={"flex flex-col w-full  px-4  overflow-y-auto"}
              >
                <ChatWindow
                  user={user}
                  listing={listing}
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
                {/* <LoremIpsum /> */}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.NestedRoot>
      </StyledCallout>

      {listing.description && (
        <>
          <h3>{listing.type === "business" ? "Donation details" : "About"}</h3>
          <p>{listing.description}</p>
        </>
      )}

      {!modal && (
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
